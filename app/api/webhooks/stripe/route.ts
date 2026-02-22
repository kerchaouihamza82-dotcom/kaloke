import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[v0] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[v0] Webhook event type:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[v0] Checkout session completed:', session.id)
        
        const userId = session.metadata?.userId
        const productId = session.metadata?.productId

        if (!userId) {
          console.error('[v0] No userId in session metadata')
          return NextResponse.json({ error: 'No userId' }, { status: 400 })
        }

        // Mark user as having paid access
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: userId,
            has_access: true,
            subscription_type: productId,
            subscribed_at: new Date().toISOString(),
          })

        if (updateError) {
          console.error('[v0] Error updating user profile:', updateError)
          throw updateError
        }

        console.log('[v0] User access granted:', userId)

        // Create a notification for the user
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: userId,
            title: '¡Bienvenido a DigiCash Academy!',
            message: 'Tu suscripción ha sido activada. Ya puedes acceder a todos los contenidos.',
            type: 'success',
          })

        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        console.log('[v0] Subscription cancelled:', subscription.id)
        
        // Find user by subscription ID and revoke access
        const { data: profiles } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('subscription_type', 'monthly-plan')
          .limit(1)

        if (profiles && profiles.length > 0) {
          await supabaseAdmin
            .from('user_profiles')
            .update({ has_access: false })
            .eq('id', profiles[0].id)
          
          console.log('[v0] Access revoked for user:', profiles[0].id)
        }

        break

      default:
        console.log('[v0] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
