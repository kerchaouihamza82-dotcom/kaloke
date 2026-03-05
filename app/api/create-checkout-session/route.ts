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
    // user_profiles may not exist yet — handle gracefully
    let customerId: string | null = null
    try {
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileErr) {
        console.log('[v0] user_profiles lookup error (table may not exist yet):', profileErr.message)
      } else {
        customerId = profile?.stripe_customer_id ?? null
        console.log('[v0] user_profiles found, customerId:', customerId)
      }
    } catch (e: any) {
      console.log('[v0] user_profiles exception:', e?.message)
    }

    if (!customerId) {
      // Check if a Stripe customer already exists for this email to avoid duplicates
      const existing = await stripe.customers.list({ email: user.email!, limit: 1 })
      if (existing.data.length > 0) {
        customerId = existing.data[0].id
        console.log('[v0] Reusing existing Stripe customer:', customerId)
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_uid: userId },
        })
        customerId = customer.id
        console.log('[v0] Created new Stripe customer:', customerId)
      }

      // Try to persist the customer id, but don't fail if the table is missing
      try {
        await supabaseAdmin
          .from('user_profiles')
          .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' })
      } catch (e: any) {
        console.log('[v0] Could not save stripe_customer_id to user_profiles:', e?.message)
      }
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
