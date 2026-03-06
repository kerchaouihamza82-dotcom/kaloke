import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Admin client — bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] Invalid signature:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Pago completado ───────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string

        if (!userId) break

        // Activar acceso en user_profiles
        await supabase.from('user_profiles').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          has_access: true,
          plan: session.metadata?.productId ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        // Guardar suscripción si existe
        const subscriptionId = session.subscription as string | null
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          await supabase.from('suscripciones').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: session.metadata?.productId ?? null,
            estado: 'activa',
            fecha_inicio: new Date(sub.start_date * 1000).toISOString(),
            fecha_fin: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
        break
      }

      // ── Factura pagada (renovación) ────────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile?.user_id) break

        await supabase.from('user_profiles').update({
          has_access: true,
          updated_at: new Date().toISOString(),
        }).eq('user_id', profile.user_id)

        const subscriptionId = invoice.subscription as string | null
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          await supabase.from('suscripciones').update({
            estado: 'activa',
            fecha_fin: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      // ── Pago fallido ───────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile?.user_id) break

        await supabase.from('user_profiles').update({
          has_access: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', profile.user_id)

        await supabase.from('suscripciones').update({
          estado: 'pago_fallido',
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId)
        break
      }

      // ── Suscripción cancelada ──────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile?.user_id) break

        await supabase.from('user_profiles').update({
          has_access: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', profile.user_id)

        await supabase.from('suscripciones').update({
          estado: 'cancelada',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

    }
  } catch (err: any) {
    console.error('[webhook] Handler error:', err.message)
  }

  return NextResponse.json({ received: true })
}
