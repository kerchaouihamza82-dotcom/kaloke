import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'

const APP_URL = 'https://v0-digicashacademy.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, email } = body

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Email y producto son requeridos' },
        { status: 400 }
      )
    }

    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json(
        { error: `Producto no encontrado: ${productId}` },
        { status: 400 }
      )
    }

    // Buscar customer existente o crear uno nuevo
    const existing = await stripe.customers.list({ email, limit: 1 })
    const customerId = existing.data.length > 0
      ? existing.data[0].id
      : (await stripe.customers.create({ email, metadata: { source: 'digicash_academy' } })).id

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/inscribete`,
      metadata: { productId: product.id, email },
      subscription_data: { metadata: { productId: product.id, email } },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] ERROR:', error?.message)
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
