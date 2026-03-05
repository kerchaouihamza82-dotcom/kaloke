import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

// Use service role key to bypass RLS when writing subscription data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature: ' + err.message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId ?? session.client_reference_id
        const email = session.customer_email ?? session.customer_details?.email
        const subscriptionId = session.subscription as string | null
        const customerId = session.customer as string

        if (!userId) {
          console.error('[webhook] checkout.session.completed: missing userId in metadata')
          break
        }

        // Retrieve subscription details from Stripe
        let periodEnd: string | null = null
        let priceId: string | null = null
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          const item = sub.items.data[0]
          priceId = item?.price?.id ?? null
          periodEnd = new Date(sub.current_period_end * 1000).toISOString()
        }

        await supabaseAdmin.from('suscripciones').upsert({
          user_id: userId,
          email,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          price_id: priceId,
          estado: 'activa',
          fecha_inicio: new Date().toISOString(),
          fecha_fin: periodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        // Also grant access in user_profiles
        await supabaseAdmin.from('user_profiles').upsert({
          user_id: userId,
          has_access: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        const isActive = sub.status === 'active' || sub.status === 'trialing'

        if (!userId) break

        await supabaseAdmin.from('suscripciones').update({
          estado: isActive ? 'activa' : 'inactiva',
          fecha_fin: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId

        if (!userId) break

        await supabaseAdmin.from('suscripciones').update({
          estado: 'cancelada',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        await supabaseAdmin.from('user_profiles').update({
          has_access: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = invoice.subscription
          ? await stripe.subscriptions.retrieve(invoice.subscription as string)
          : null
        const userId = sub?.metadata?.userId

        if (!userId) break

        await supabaseAdmin.from('suscripciones').update({
          estado: 'inactiva',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (err: any) {
    console.error('[webhook] Error processing event:', event.type, err.message)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
