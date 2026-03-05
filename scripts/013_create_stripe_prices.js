// Creates the two DigiCash Academy prices in Stripe TEST mode
// and outputs the new price IDs to update products.ts
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('[ERROR] STRIPE_SECRET_KEY is not set')
  process.exit(1)
}

async function stripePost(endpoint, params) {
  const body = new URLSearchParams(params).toString()
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
  return data
}

async function stripeGet(endpoint) {
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
  return data
}

async function getOrCreateProduct(name, description) {
  // Search for existing product with this name
  const list = await stripeGet(`products?active=true&limit=100`)
  const existing = list.data.find(p => p.name === name)
  if (existing) {
    console.log(`[OK] Product already exists: ${existing.id} (${name})`)
    return existing.id
  }
  const product = await stripePost('products', { name, description })
  console.log(`[OK] Created product: ${product.id} (${name})`)
  return product.id
}

async function main() {
  console.log('=== CREATING STRIPE TEST MODE PRICES ===')
  console.log('')

  // ── Plan Mensual: $9.99/month recurring ───────────────────────────────
  const mensualProductId = await getOrCreateProduct(
    'DigiCash Academy — Plan Mensual',
    'Acceso mensual a DigiCash Academy'
  )
  const mensualPrice = await stripePost('prices', {
    product: mensualProductId,
    unit_amount: '999',      // $9.99
    currency: 'usd',
    'recurring[interval]': 'month',
  })
  console.log('[OK] Plan Mensual price created:')
  console.log('     Price ID:', mensualPrice.id)
  console.log('     Amount:  $9.99/month')
  console.log('')

  // ── Plan Completo: $2,500/year recurring ─────────────────────────────
  const anualProductId = await getOrCreateProduct(
    'DigiCash Academy — Plan Completo',
    'Acceso anual completo a DigiCash Academy'
  )
  const anualPrice = await stripePost('prices', {
    product: anualProductId,
    unit_amount: '250000',   // $2,500
    currency: 'usd',
    'recurring[interval]': 'year',
  })
  console.log('[OK] Plan Completo price created:')
  console.log('     Price ID:', anualPrice.id)
  console.log('     Amount:  $2,500/year')
  console.log('')

  console.log('=== UPDATE products.ts WITH THESE IDS ===')
  console.log(`mensual  stripePriceId: '${mensualPrice.id}'`)
  console.log(`anual    stripePriceId: '${anualPrice.id}'`)
}

main().catch(err => {
  console.error('[ERROR]', err.message)
  process.exit(1)
})
