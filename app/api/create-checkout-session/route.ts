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
    const body = await request.json()
    // Support both productId (new) and priceId (legacy) fields
    const { productId, priceId: legacyPriceId, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Resolve the product — look up by productId first, then by stripePriceId for legacy calls
    let product = productId
      ? PRODUCTS.find((p) => p.id === productId)
      : PRODUCTS.find((p) => p.stripePriceId === legacyPriceId)

    if (!product) {
      return NextResponse.json({ error: 'Invalid product or price ID' }, { status: 400 })
    }

    // Get user from Supabase
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    // Reuse or create Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: userId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('user_profiles')
        .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' })
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'

    // Use hosted redirect mode so the page gets back a `url` to redirect to
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      mode: product.type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscribete`,
      metadata: {
        userId,
        productId: product.id,
      },
      ...(product.type === 'subscription'
        ? {
            subscription_data: {
              metadata: { userId, productId: product.id },
            },
          }
        : {
            payment_intent_data: {
              metadata: { userId, productId: product.id },
            },
          }),
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
