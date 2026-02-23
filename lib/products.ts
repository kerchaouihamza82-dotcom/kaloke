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
    stripePriceId: 'price_1T45v8CYzThxiyRJCXiIfyb5',
    stripeProductId: 'prod_U2ABUpsjW3OxdT',
  },
  {
    id: 'plan-completo',
    name: 'Plan Completo',
    description: 'Acceso de por vida a DigiCash Academy',
    priceInCents: 250000, // $2,500
    type: 'one-time',
    stripePriceId: 'price_1T45wGCYzThxiyRJNHBsbKSR',
    stripeProductId: 'prod_U2ABjVW8xN5RU2',
  },
]
