// Simulate a checkout session creation with the actual env vars
// This bypasses the browser completely and shows the exact Stripe error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
})

const PRICE_MENSUAL = 'price_1T7cBgGXPveWbaAfVlivnMcG'
const PRICE_ANUAL   = 'price_1T7cE1GXPveWbaAfZHbjhuxj'

console.log('--- STRIPE CHECKOUT DIAGNOSTIC ---')
console.log('Key mode:', process.env.STRIPE_SECRET_KEY?.substring(0, 12))
console.log()

// Step 1: Verify prices exist
for (const [name, priceId] of [['Plan Mensual', PRICE_MENSUAL], ['Plan Completo', PRICE_ANUAL]]) {
  try {
    const price = await stripe.prices.retrieve(priceId)
    console.log(`[OK] ${name}: ${priceId} — ${price.currency.toUpperCase()} ${(price.unit_amount / 100).toFixed(2)} — active: ${price.active} — type: ${price.type}`)
  } catch (e) {
    console.log(`[FAIL] ${name}: ${priceId} — ERROR: ${e.message}`)
  }
}

console.log()

// Step 2: Try creating a real checkout session (with a dummy customer)
try {
  const customer = await stripe.customers.create({
    email: 'test-diagnostic@kaloke.com',
    metadata: { diagnostic: 'true' },
  })
  console.log('[OK] Customer created:', customer.id)

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    line_items: [{ price: PRICE_MENSUAL, quantity: 1 }],
    mode: 'subscription',
    success_url: 'https://kaloke.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://kaloke.com/inscribete',
    metadata: { userId: 'test', productId: 'plan-mensual' },
    subscription_data: { metadata: { userId: 'test', productId: 'plan-mensual' } },
  })
  console.log('[OK] Checkout session created:', session.id)
  console.log('[OK] Session URL:', session.url?.substring(0, 60) + '...')

  // Clean up
  await stripe.customers.del(customer.id)
  console.log('[OK] Test customer deleted')
} catch (e) {
  console.log('[FAIL] Checkout session ERROR:', e.message)
  console.log('[FAIL] Error type:', e.type)
  console.log('[FAIL] Error code:', e.code)
}
