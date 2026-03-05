export interface Product {
  id: string
  name: string
  priceInCents: number
  mode: 'subscription' | 'payment'
  stripePriceId: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'plan-mensual',
    name: 'Plan Mensual',
    priceInCents: 999,
    mode: 'subscription',
    stripePriceId: 'price_1T7cBgGXPveWbaAfVlivnMcG',
  },
  {
    id: 'plan-completo',
    name: 'Plan Completo Anual',
    priceInCents: 250000,
    mode: 'subscription',
    stripePriceId: 'price_1T7cE1GXPveWbaAfZHbjhuxj',
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
