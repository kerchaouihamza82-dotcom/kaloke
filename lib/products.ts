export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  type: 'subscription' | 'one-time'
  interval?: 'month' | 'year'
  stripePriceId: string
  stripeProductId: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'plan-mensual',
    name: 'Plan Mensual',
    description: 'Acceso mensual a todos los campus de DigiCash Academy',
    priceInCents: 999, // $9.99
    type: 'subscription',
    interval: 'month',
    stripePriceId: 'price_1T7kkbCYzThxiyRJmdzfnfeC',
    stripeProductId: 'prod_U5wM2V6Ng2uZTS',
  },
  {
    id: 'plan-completo',
    name: 'Plan Completo',
    description: 'Acceso anual completo a DigiCash Academy',
    priceInCents: 250000, // $2,500/año
    type: 'subscription',
    interval: 'year',
    stripePriceId: 'price_1T7kkbCYzThxiyRJrBEh7Ddh',
    stripeProductId: 'prod_U5wMCNSEw4HHS6',
  },
]
