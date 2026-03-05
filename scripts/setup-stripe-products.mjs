import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
})

async function main() {
  console.log('[Setup] Creating products in Stripe LIVE mode...')

  // 1. Create Plan Mensual product
  const monthlyProduct = await stripe.products.create({
    name: 'Plan Mensual - Digicash Academy',
    description: 'Acceso mensual a los 5 campus especializados con contenido actualizado diariamente, comunidad privada, recursos descargables y soporte prioritario',
  })
  console.log('[Setup] Monthly product created:', monthlyProduct.id)

  // 2. Create monthly price ($9.99/month)
  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
  })
  console.log('[Setup] Monthly price created:', monthlyPrice.id)

  // 3. Create Plan Completo product (annual subscription)
  const annualProduct = await stripe.products.create({
    name: 'Plan Completo - Digicash Academy',
    description: 'Suscripcion anual con acceso completo a todos los campus, actualizaciones futuras, sesiones de mentoria 1 a 1, grupo VIP exclusivo y certificados',
  })
  console.log('[Setup] Annual product created:', annualProduct.id)

  // 4. Create annual price ($2,500/year recurring)
  const annualPrice = await stripe.prices.create({
    product: annualProduct.id,
    unit_amount: 250000,
    currency: 'usd',
    recurring: { interval: 'year' },
  })
  console.log('[Setup] Annual price created:', annualPrice.id)

  // Output the IDs to update products.ts
  console.log('\n=== COPY THESE IDs TO lib/products.ts ===')
  console.log(`Plan Mensual - Product: ${monthlyProduct.id}, Price: ${monthlyPrice.id}`)
  console.log(`Plan Completo (Anual) - Product: ${annualProduct.id}, Price: ${annualPrice.id}`)
}

main().catch(console.error)
