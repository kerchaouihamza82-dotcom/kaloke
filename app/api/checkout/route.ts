import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'

const APP_URL = 'https://v0-digicashacademy.vercel.app'

// Admin client bypasses RLS — for reading/writing user_profiles
const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticar al usuario desde las cookies del request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
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

    // 2. Validar producto
    const body = await request.json()
    const product = getProductById(body.productId)

    if (!product) {
      return NextResponse.json(
        { error: `Producto no encontrado: ${body.productId}` },
        { status: 400 }
      )
    }

    // 3. Buscar o crear Stripe Customer usando admin client (evita bloqueo RLS)
    let customerId: string | undefined

    const { data: profile } = await admin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      // Reusar customer existente en Stripe si coincide el email
      const existing = await stripe.customers.list({ email: user.email!, limit: 1 })
      if (existing.data.length > 0) {
        customerId = existing.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: user.email!,
          metadata: { supabase_uid: user.id },
        })
        customerId = customer.id
      }

      // Persistir con admin client para saltar RLS
      await admin
        .from('user_profiles')
        .upsert(
          { user_id: user.id, stripe_customer_id: customerId },
          { onConflict: 'user_id' }
        )
    }

    // 4. Crear sesión de Stripe Checkout (redirect mode)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: product.mode,
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/inscribete`,
      metadata: { userId: user.id, productId: product.id },
      subscription_data: {
        metadata: { userId: user.id, productId: product.id },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] Error:', error?.message)
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
