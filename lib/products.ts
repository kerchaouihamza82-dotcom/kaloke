export interface Product {
  id: string
  name: string
  priceInCents: number
  mode: 'subscription'
  interval: 'month' | 'year'
  stripePriceId: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'plan-mensual',
    name: 'Plan Mensual',
    priceInCents: 999,
    mode: 'subscription',
    interval: 'month',
    stripePriceId: 'price_1T7xLDAfevND1plyW0kSqQS8',
  },
  {
    id: 'plan-completo',
    name: 'Plan Completo Anual',
    priceInCents: 250000,
    mode: 'subscription',
    interval: 'year',
    stripePriceId: 'price_1T7xLSAfevND1plyVDtPEjgv',
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
