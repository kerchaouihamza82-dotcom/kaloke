import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

const APP_URL = 'https://v0-digicashacademy.vercel.app'

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar sesión del usuario desde las cookies del servidor
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado. Inicia sesión primero.' }, { status: 401 })
    }

    // 2. Obtener el producto solicitado
    const body = await request.json()
    const { productId } = body

    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: `Producto no encontrado: ${productId}` }, { status: 400 })
    }

    // 3. Buscar o crear customer de Stripe
    let customerId: string | undefined

    // Buscar si ya tiene customer guardado
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      // Crear nuevo customer en Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id },
      })
      customerId = customer.id

      // Guardar en user_profiles (no bloquear si falla)
      await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' })
    }

    // 4. Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: product.mode,
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/inscribete`,
      metadata: { userId: user.id, productId: product.id },
      ...(product.mode === 'subscription' && {
        subscription_data: { metadata: { userId: user.id, productId: product.id } },
      }),
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}
