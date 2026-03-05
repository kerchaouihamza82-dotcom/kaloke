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
    stripePriceId: 'price_1T7cBgGXPveWbaAfVlivnMcG',
    stripeProductId: 'prod_U2C0aP4F36loA6',
  },
  {
    id: 'plan-completo',
    name: 'Plan Completo',
    description: 'Acceso anual a DigiCash Academy',
    priceInCents: 250000, // $2,500
    type: 'subscription',
    interval: 'year',
    stripePriceId: 'price_1T7cE1GXPveWbaAfZHbjhuxj',
    stripeProductId: 'prod_U2C0T76GCy1vAu',
  },
]
