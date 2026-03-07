import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function main() {
  console.log('Usando key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20))

  // Crear producto mensual
  const prodMensual = await stripe.products.create({
    name: 'Plan Mensual - DigiCash Academy',
    description: 'Acceso mensual completo a DigiCash Academy',
  })

  const priceMensual = await stripe.prices.create({
    product: prodMensual.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
  })

  console.log('MENSUAL product:', prodMensual.id)
  console.log('MENSUAL price:', priceMensual.id)

  // Crear producto anual
  const prodAnual = await stripe.products.create({
    name: 'Plan Completo Anual - DigiCash Academy',
    description: 'Acceso anual completo a DigiCash Academy',
  })

  const priceAnual = await stripe.prices.create({
    product: prodAnual.id,
    unit_amount: 250000,
    currency: 'usd',
    recurring: { interval: 'year' },
  })

  console.log('ANUAL product:', prodAnual.id)
  console.log('ANUAL price:', priceAnual.id)

  console.log('\n=== RESULTADO FINAL ===')
  console.log('stripePriceId mensual:', priceMensual.id)
  console.log('stripePriceId anual:', priceAnual.id)
}

main().catch(console.error)
