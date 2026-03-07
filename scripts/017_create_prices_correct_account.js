const Stripe = require('stripe')

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('ERROR: STRIPE_SECRET_KEY no está configurada')
  process.exit(1)
}

const stripe = new Stripe(key)

async function main() {
  console.log('Cuenta Stripe key prefix:', key.substring(0, 18))

  // Crear producto mensual
  const prodMensual = await stripe.products.create({
    name: 'Plan Mensual - DigiCash Academy',
    description: 'Acceso mensual completo a DigiCash Academy',
  })
  console.log('Producto mensual creado:', prodMensual.id)

  // Crear precio mensual $9.99/mes
  const priceMensual = await stripe.prices.create({
    product: prodMensual.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
  })
  console.log('PRICE_MENSUAL:', priceMensual.id)

  // Crear producto anual
  const prodAnual = await stripe.products.create({
    name: 'Plan Completo Anual - DigiCash Academy',
    description: 'Acceso anual completo a DigiCash Academy',
  })
  console.log('Producto anual creado:', prodAnual.id)

  // Crear precio anual $2,500/año
  const priceAnual = await stripe.prices.create({
    product: prodAnual.id,
    unit_amount: 250000,
    currency: 'usd',
    recurring: { interval: 'year' },
  })
  console.log('PRICE_ANUAL:', priceAnual.id)

  console.log('---')
  console.log('Copia estos IDs en products.ts:')
  console.log('plan-mensual stripePriceId:', priceMensual.id)
  console.log('plan-completo stripePriceId:', priceAnual.id)
}

main().catch(e => {
  console.error('ERROR:', e.message)
  process.exit(1)
})
