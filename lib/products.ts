export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  type: 'subscription' | 'one-time'
  interval?: 'month' | 'year'
}

export const PRODUCTS: Product[] = [
  {
    id: 'monthly-plan',
    name: 'Plan Mensual',
    description: 'Acceso mensual a todos los campus de DigiCash Academy',
    priceInCents: 999, // $9.99
    type: 'subscription',
    interval: 'month',
  },
  {
    id: 'lifetime-plan',
    name: 'Plan Completo',
    description: 'Acceso de por vida a DigiCash Academy',
    priceInCents: 250000, // $2,500
    type: 'one-time',
  },
]
