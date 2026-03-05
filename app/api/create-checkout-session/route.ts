import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS
// Use server-only SUPABASE_URL first, fall back to NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!
const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 400 })
    }

    // ── Get user email via service role (no admin API needed) ──────────────
    // We query auth.users indirectly through profiles or use auth.admin
    let userEmail: string | null = null
    try {
      const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!error && authUser?.user?.email) {
        userEmail = authUser.user.email
      }
    } catch {
      // Non-fatal — we'll create the customer without an email
    }

    // ── Reuse existing Stripe customer ────────────────────────────────────
    let customerId: string | null = null

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    customerId = profile?.stripe_customer_id ?? null

    if (!customerId) {
      // Search by email to avoid duplicates
      if (userEmail) {
        const existing = await stripe.customers.list({ email: userEmail, limit: 1 })
        if (existing.data.length > 0) {
          customerId = existing.data[0].id
        }
      }

      if (!customerId) {
        const customer = await stripe.customers.create({
          ...(userEmail ? { email: userEmail } : {}),
          metadata: { supabase_uid: userId },
        })
        customerId = customer.id
      }

      // Persist — best effort
      await supabaseAdmin
        .from('user_profiles')
        .upsert(
          { user_id: userId, stripe_customer_id: customerId },
          { onConflict: 'user_id' }
        )
    }

    // ── Build origin for redirect URLs ───────────────────────────────────
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://v0-digicashacademy.vercel.app'

    // ── Determine checkout mode ───────────────────────────────────────────
    const mode = product.type === 'subscription' ? 'subscription' : 'payment'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      mode,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscribete`,
      // Pass userId in session metadata AND subscription metadata so webhook can always find the user
      metadata: {
        userId,
        productId: product.id,
      },
      ...(mode === 'subscription'
        ? { subscription_data: { metadata: { userId, productId: product.id } } }
        : { payment_intent_data: { metadata: { userId, productId: product.id } } }),
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] Error:', error?.message, error?.type, error?.code)
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
