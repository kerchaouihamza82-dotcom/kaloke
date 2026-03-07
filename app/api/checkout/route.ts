import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'

const APP_URL = 'https://v0-digicashacademy.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'Producto requerido' }, { status: 400 })
    }

    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: `Producto no encontrado: ${productId}` }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/inscribete`,
      metadata: { productId: product.id },
      subscription_data: { metadata: { productId: product.id } },
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
