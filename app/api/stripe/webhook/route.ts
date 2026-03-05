import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

// Service role client — bypasses RLS for writing subscription data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper: resolve userId from metadata OR by looking up stripe_subscription_id in DB
async function resolveUserId(
  metadata: Record<string, string> | null,
  stripeSubscriptionId?: string | null
): Promise<string | null> {
  if (metadata?.userId) return metadata.userId

  if (stripeSubscriptionId) {
    const { data } = await supabase
      .from('suscripciones')
      .select('user_id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()
    if (data?.user_id) return data.user_id
  }

  return null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ─── Payment completed → activate subscription ───────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId ?? session.client_reference_id
        const email = session.customer_email ?? session.customer_details?.email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string | null

        if (!userId) break

        let periodEnd: string | null = null
        let priceId: string | null = null

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          priceId = sub.items.data[0]?.price?.id ?? null
          periodEnd = new Date(sub.current_period_end * 1000).toISOString()
        }

        await supabase.from('suscripciones').upsert({
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

        await supabase.from('user_profiles').upsert({
          user_id: userId,
          has_access: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        break
      }

      // ─── Subscription changed (renewal, cancel, etc.) ─────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(
          sub.metadata as Record<string, string>,
          sub.id
        )

        if (!userId) break

        const isActive = sub.status === 'active' || sub.status === 'trialing'

        await supabase.from('suscripciones').update({
          estado: isActive ? 'activa' : 'inactiva',
          fecha_fin: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        if (!isActive) {
          await supabase.from('user_profiles').update({
            has_access: false,
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId)
        }

        break
      }

      // ─── Subscription cancelled → revoke access ───────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(
          sub.metadata as Record<string, string>,
          sub.id
        )

        if (!userId) break

        await supabase.from('suscripciones').update({
          estado: 'cancelada',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        await supabase.from('user_profiles').update({
          has_access: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      // ─── Payment failed → mark inactive ───────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string | null
        const userId = await resolveUserId(null, subscriptionId)

        if (!userId) break

        await supabase.from('suscripciones').update({
          estado: 'inactiva',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      default:
        break
    }
  } catch (err: any) {
    // Return 200 so Stripe doesn't retry — log the error internally
    console.error('[webhook] Error handling event type:', event.type)
    return NextResponse.json({ received: true })
  }

  // Always return 200 OK to Stripe
  return NextResponse.json({ received: true })
}
