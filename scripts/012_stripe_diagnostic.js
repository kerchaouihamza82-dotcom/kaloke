// Diagnostic script: verifies Stripe key mode and price IDs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  console.error('[ERROR] STRIPE_SECRET_KEY is not set')
  process.exit(1)
}

const keyMode = STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 
                STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'UNKNOWN'

console.log('=== STRIPE DIAGNOSTIC ===')
console.log('Key mode:', keyMode)
console.log('Key prefix:', STRIPE_SECRET_KEY.substring(0, 20) + '...')
console.log('')

const PRICE_IDS = [
  { id: 'price_1T7cBgGXPveWbaAfVlivnMcG', label: 'Plan Mensual $9.99' },
  { id: 'price_1T7cE1GXPveWbaAfZHbjhuxj', label: 'Plan Completo $2,500/año' },
]

async function checkPrice(priceId, label) {
  const res = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
    },
  })
  const data = await res.json()
  if (res.ok) {
    console.log(`[OK] ${label}`)
    console.log(`     id: ${data.id}`)
    console.log(`     unit_amount: $${(data.unit_amount / 100).toFixed(2)}`)
    console.log(`     type: ${data.type}`)
    console.log(`     recurring: ${data.recurring ? JSON.stringify(data.recurring) : 'none'}`)
    console.log(`     active: ${data.active}`)
    console.log(`     livemode: ${data.livemode}`)
  } else {
    console.log(`[ERROR] ${label}`)
    console.log(`     price_id: ${priceId}`)
    console.log(`     error: ${data.error?.message}`)
    console.log(`     SOLUTION: Create this price in Stripe ${keyMode} mode`)
  }
  console.log('')
}

async function checkWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  console.log('=== WEBHOOK SECRET ===')
  if (!secret) {
    console.log('[ERROR] STRIPE_WEBHOOK_SECRET is NOT set in env vars')
    console.log('        Without this, the webhook will reject ALL Stripe events')
    console.log('        Access will NEVER be granted after payment')
    console.log('        SOLUTION: Go to Stripe Dashboard > Webhooks > copy Signing Secret > add to project vars as STRIPE_WEBHOOK_SECRET')
  } else {
    console.log('[OK] STRIPE_WEBHOOK_SECRET is set, prefix:', secret.substring(0, 10) + '...')
    const secretMode = secret.startsWith('whsec_') ? 'valid format' : 'UNEXPECTED format'
    console.log('     format:', secretMode)
  }
  console.log('')
}

async function main() {
  await checkWebhookSecret()
  for (const p of PRICE_IDS) {
    await checkPrice(p.id, p.label)
  }
}

main().catch(console.error)
