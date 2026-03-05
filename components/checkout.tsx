'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Use live publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_live_51RTVmQBNyZln5VT1UxulM980MhDBKbMzKKxuGZG27Km7xPVAkjNfhL5TyWPpKAJTs784CtHkM1fCQEWw7aeNDPYm00PzbYTcpy'
)

interface CheckoutProps {
  productId: string
  userId: string
}

export function Checkout({ productId, userId }: CheckoutProps) {
  const fetchClientSecret = useCallback(async () => {
    // Call API route instead of server action
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, userId }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { clientSecret } = await response.json()
    return clientSecret
  }, [productId, userId])

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
