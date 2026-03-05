import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

// Service-role client — bypasses RLS
// Use server-only SUPABASE_URL first, fall back to NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!
const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Resolve the Supabase userId from different Stripe event sources ────────
async function resolveUserId(
  metadata: Record<string, string> | null | undefined,
  stripeSubscriptionId?: string | null,
  stripeCustomerId?: string | null
): Promise<string | null> {
  // 1. Metadata is always most reliable (set by us at checkout creation)
  if (metadata?.userId) return metadata.userId

  // 2. Look up by subscription id in suscripciones table
  if (stripeSubscriptionId) {
    const { data } = await supabase
      .from('suscripciones')
      .select('user_id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle()
    if (data?.user_id) return data.user_id
  }

  // 3. Look up by customer id in user_profiles table
  if (stripeCustomerId) {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle()
    if (data?.user_id) return data.user_id
  }

  return null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── checkout.session.completed → activate access ─────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId ?? session.client_reference_id
        const email = session.customer_details?.email ?? session.customer_email
        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null

        if (!userId) {
          console.error('[webhook] checkout.session.completed: no userId in metadata')
          break
        }

        let periodEnd: string | null = null
        let priceId: string | null = null
        let subscriptionStatus: string | null = null

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          priceId = sub.items.data[0]?.price?.id ?? null
          periodEnd = new Date(sub.current_period_end * 1000).toISOString()
          subscriptionStatus = sub.status
        }

        // Save subscription record
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

        // Grant access
        await supabase.from('user_profiles').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          has_access: true,
          subscription_status: subscriptionStatus ?? 'active',
          subscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        break
      }

      // ── customer.subscription.updated → sync status ───────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(
          sub.metadata as Record<string, string>,
          sub.id,
          sub.customer as string
        )

        if (!userId) {
          console.error('[webhook] customer.subscription.updated: could not resolve userId for sub', sub.id)
          break
        }

        const isActive = sub.status === 'active' || sub.status === 'trialing'
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

        await supabase.from('suscripciones').update({
          estado: isActive ? 'activa' : 'inactiva',
          fecha_fin: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        await supabase.from('user_profiles').update({
          has_access: isActive,
          subscription_status: sub.status,
          subscription_current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      // ── customer.subscription.deleted → revoke access ─────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(
          sub.metadata as Record<string, string>,
          sub.id,
          sub.customer as string
        )

        if (!userId) {
          console.error('[webhook] customer.subscription.deleted: could not resolve userId for sub', sub.id)
          break
        }

        await supabase.from('suscripciones').update({
          estado: 'cancelada',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        await supabase.from('user_profiles').update({
          has_access: false,
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      // ── invoice.paid → keep access active on renewal ──────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string | null
        const customerId = invoice.customer as string | null

        // invoice metadata is not set by us, so rely on subscription/customer lookup
        const userId = await resolveUserId(null, subscriptionId, customerId)

        if (!userId) {
          // Not necessarily an error — could be a one-time invoice not tied to a user
          break
        }

        const periodEnd = subscriptionId
          ? new Date((await stripe.subscriptions.retrieve(subscriptionId)).current_period_end * 1000).toISOString()
          : null

        await supabase.from('suscripciones').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          estado: 'activa',
          ...(periodEnd ? { fecha_fin: periodEnd } : {}),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        await supabase.from('user_profiles').upsert({
          user_id: userId,
          has_access: true,
          subscription_status: 'active',
          ...(periodEnd ? { subscription_current_period_end: periodEnd } : {}),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        break
      }

      // ── invoice.payment_failed → revoke access ────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string | null
        const customerId = invoice.customer as string | null
        const userId = await resolveUserId(null, subscriptionId, customerId)

        if (!userId) break

        await supabase.from('suscripciones').update({
          estado: 'pago_fallido',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        await supabase.from('user_profiles').update({
          has_access: false,
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        break
      }

      default:
        // Ignore unhandled events
        break
    }
  } catch (err: any) {
    console.error('[webhook] Error processing event:', event.type, err?.message)
    // Return 200 so Stripe does NOT retry — internal error logged above
  }

  return NextResponse.json({ received: true })
}
