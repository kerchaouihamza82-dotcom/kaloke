import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await request.json()

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, userId, userEmail' },
        { status: 400 }
      )
    }

    // Find the product by its Stripe price ID
    const product = PRODUCTS.find((p) => p.stripePriceId === priceId)
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if it doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_uid: userId },
      })
      customerId = customer.id

      // Save the customer ID in the profile
      await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: userId,
          stripe_customer_id: customerId,
        })
    }

    // Build the checkout session params
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const sessionParams: Record<string, unknown> = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: product.type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscribete?cancelled=true`,
      metadata: {
        userId,
        productId: product.id,
        subscriptionType: product.type,
      },
    }

    // For subscriptions, add subscription metadata too
    if (product.type === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          userId,
          productId: product.id,
        },
      }
    }

    // For one-time payments, add payment intent metadata
    if (product.type === 'one-time') {
      sessionParams.payment_intent_data = {
        metadata: {
          userId,
          productId: product.id,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams as any)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
