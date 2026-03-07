import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const stripe = getStripe()
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] Invalid signature:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.customer_details?.email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const productId = session.metadata?.productId || 'plan-mensual'

        if (!email) { console.error('[webhook] No email in session'); break }

        const { data: { users } } = await admin.auth.admin.listUsers()
        const existingUser = users.find(u => u.email === email)
        let userId: string

        if (existingUser) {
          userId = existingUser.id
        } else {
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const { data: newUser, error } = await admin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
          })
          if (error || !newUser?.user) { console.error('[webhook] Error creating user:', error?.message); break }
          userId = newUser.user.id

          await admin.from('password_setup_tokens').insert({
            user_id: userId,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
        }

        let periodEnd: string | null = null
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          periodEnd = new Date(sub.current_period_end * 1000).toISOString()
        }

        await admin.from('user_profiles').upsert({
          user_id: userId,
          email,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          has_access: true,
          plan: productId,
          subscribed_at: new Date().toISOString(),
          fecha_fin: periodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        await admin.from('suscripciones').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: productId,
          estado: 'activa',
          fecha_inicio: new Date().toISOString(),
          fecha_fin: periodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' })

        console.log('[webhook] Acceso activado para:', email)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = invoice.subscription as string

        let periodEnd: string | null = null
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          periodEnd = new Date(sub.current_period_end * 1000).toISOString()
        }

        await admin.from('user_profiles').update({
          has_access: true,
          subscription_status: 'active',
          fecha_fin: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId)

        await admin.from('suscripciones').update({
          estado: 'activa',
          fecha_fin: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscriptionId)

        console.log('[webhook] Renovación procesada:', customerId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await admin.from('user_profiles').update({
          has_access: false,
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId)

        console.log('[webhook] Pago fallido:', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        await admin.from('user_profiles').update({
          has_access: false,
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId)

        await admin.from('suscripciones').update({
          estado: 'cancelada',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)

        console.log('[webhook] Suscripción cancelada:', customerId)
        break
      }
    }
  } catch (err: any) {
    console.error('[webhook] Handler error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
