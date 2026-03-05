import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'

// Service-role admin client
const supabaseAdmin = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    // ── 1. Authenticate via session cookie (server-side) ─────────────────
    // This is the correct way — never trust userId from the client body
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión primero.' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email ?? null

    // ── 2. Validate product ───────────────────────────────────────────────
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      return NextResponse.json({ error: `Producto no encontrado: ${productId}` }, { status: 400 })
    }

    // ── 3. Reuse or create Stripe customer ───────────────────────────────
    let customerId: string | null = null

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    customerId = profile?.stripe_customer_id ?? null

    if (!customerId && userEmail) {
      const existing = await stripe.customers.list({ email: userEmail, limit: 1 })
      if (existing.data.length > 0) customerId = existing.data[0].id
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        ...(userEmail ? { email: userEmail } : {}),
        metadata: { supabase_uid: userId },
      })
      customerId = customer.id
    }

    // Persist customer id — best effort
    await supabaseAdmin
      .from('user_profiles')
      .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' })

    // ── 4. Create Stripe Checkout session ────────────────────────────────
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://digicashacademy.com'

    const mode = product.type === 'subscription' ? 'subscription' : 'payment'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      mode,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscribete`,
      metadata: { userId, productId: product.id },
      ...(mode === 'subscription'
        ? { subscription_data: { metadata: { userId, productId: product.id } } }
        : { payment_intent_data: { metadata: { userId, productId: product.id } } }),
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe no devolvió una URL de pago' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('[checkout] Error:', error?.message, error?.type, error?.code)
    return NextResponse.json(
      { error: error?.message || 'Error al crear la sesión de pago' },
      { status: 500 }
    )
  }
}
