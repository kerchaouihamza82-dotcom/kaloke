import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

const APP_URL = 'https://v0-digicashacademy.vercel.app'

const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticar usuario via cookies de Next.js
    const supabase = await createClient()
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

    // 3. Buscar o crear Stripe Customer
    let customerId: string | undefined

    const { data: profile } = await admin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const existing = await stripe.customers.list({ email: user.email!, limit: 1 })
      customerId = existing.data.length > 0
        ? existing.data[0].id
        : (await stripe.customers.create({
            email: user.email!,
            metadata: { supabase_uid: user.id },
          })).id

      await admin.from('user_profiles').upsert(
        { 
          user_id: user.id, 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    }

    // 4. Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
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
    console.error('[checkout] ERROR:', error?.message, error?.type, error?.code)
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
