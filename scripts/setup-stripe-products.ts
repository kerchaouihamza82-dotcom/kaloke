import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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

  // 3. Create Plan Completo product
  const lifetimeProduct = await stripe.products.create({
    name: 'Plan Completo - Digicash Academy',
    description: 'Acceso de por vida a todos los campus, todas las actualizaciones futuras incluidas, sesiones de mentoria 1 a 1 mensuales, grupo VIP exclusivo y certificados de finalizacion',
  })
  console.log('[Setup] Lifetime product created:', lifetimeProduct.id)

  // 4. Create lifetime price ($2,500 one-time)
  const lifetimePrice = await stripe.prices.create({
    product: lifetimeProduct.id,
    unit_amount: 250000,
    currency: 'usd',
  })
  console.log('[Setup] Lifetime price created:', lifetimePrice.id)

  // Output the IDs to update products.ts
  console.log('\n=== COPY THESE IDs TO lib/products.ts ===')
  console.log(`Plan Mensual - Product: ${monthlyProduct.id}, Price: ${monthlyPrice.id}`)
  console.log(`Plan Completo - Product: ${lifetimeProduct.id}, Price: ${lifetimePrice.id}`)
}

main().catch(console.error)
