import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper: grant access to a user
async function grantAccess(userId: string, productId: string, subscriptionId?: string, currentPeriodEnd?: string) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      id: userId,
      has_access: true,
      subscription_type: productId,
      subscription_status: 'active',
      stripe_subscription_id: subscriptionId || null,
      subscription_current_period_end: currentPeriodEnd || null,
      subscribed_at: new Date().toISOString(),
    })

  if (error) throw error

  // Send welcome notification
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title: 'Bienvenido a DigiCash Academy',
    message: 'Tu suscripcion ha sido activada. Ya puedes acceder a todos los contenidos.',
    type: 'success',
  })
}

// Helper: revoke access
async function revokeAccess(stripeCustomerId: string) {
  // Find user by stripe_customer_id
  const { data: profiles } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)

  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id
    await supabaseAdmin
      .from('user_profiles')
      .update({
        has_access: false,
        subscription_status: 'cancelled',
      })
      .eq('id', userId)

    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: 'Suscripcion cancelada',
      message: 'Tu suscripcion ha sido cancelada. Puedes renovarla en cualquier momento.',
      type: 'warning',
    })
  }
}

// Helper: renew subscription period
async function renewSubscription(stripeCustomerId: string, currentPeriodEnd: string) {
  const { data: profiles } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)

  if (profiles && profiles.length > 0) {
    await supabaseAdmin
      .from('user_profiles')
      .update({
        has_access: true,
        subscription_status: 'active',
        subscription_current_period_end: currentPeriodEnd,
      })
      .eq('id', profiles[0].id)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // 1. Checkout completed - user paid successfully
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const productId = session.metadata?.productId || 'unknown'

        if (!userId) {
          console.error('[Stripe Webhook] No userId in checkout metadata')
          break
        }

        // Save stripe_customer_id if not already saved
        if (session.customer) {
          await supabaseAdmin
            .from('user_profiles')
            .upsert({ id: userId, stripe_customer_id: session.customer as string })
        }

        if (session.mode === 'subscription' && session.subscription) {
          // Get subscription details for period end
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await grantAccess(
            userId,
            productId,
            sub.id,
            new Date(sub.current_period_end * 1000).toISOString()
          )
        } else {
          // One-time payment - lifetime access
          await grantAccess(userId, productId)
        }
        break
      }

      // 2. Invoice paid - subscription renewed
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await renewSubscription(
            customerId,
            new Date(sub.current_period_end * 1000).toISOString()
          )
        }
        break
      }

      // 3. Subscription deleted - access revoked
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        await revokeAccess(customerId)
        break
      }

      default:
        // Unhandled event type - ignore
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
