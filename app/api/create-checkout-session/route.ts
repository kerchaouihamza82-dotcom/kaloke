import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, priceId: legacyPriceId, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Resolve product — by productId first, then by stripePriceId for legacy calls
    const product = productId
      ? PRODUCTS.find((p) => p.id === productId)
      : PRODUCTS.find((p) => p.stripePriceId === legacyPriceId)

    if (!product) {
      return NextResponse.json({ error: 'Invalid product or price ID' }, { status: 400 })
    }

    // Get user email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    // Try to reuse existing Stripe customer from user_profiles
    let customerId: string | null = null
    try {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle()
      customerId = profile?.stripe_customer_id ?? null
    } catch {
      // Table may not exist yet — handled below
    }

    if (!customerId) {
      // Reuse or create Stripe customer
      const existing = await stripe.customers.list({ email: user.email!, limit: 1 })
      if (existing.data.length > 0) {
        customerId = existing.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_uid: userId },
        })
        customerId = customer.id
      }

      // Persist customer id — best-effort
      try {
        await supabaseAdmin
          .from('user_profiles')
          .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' })
      } catch {
        // Non-fatal
      }
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://kaloke.vercel.app'

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
        ? { subscription_data: { metadata: { userId, productId: product.id } } }
        : { payment_intent_data: { metadata: { userId, productId: product.id } } }),
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] Error:', error?.message)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
