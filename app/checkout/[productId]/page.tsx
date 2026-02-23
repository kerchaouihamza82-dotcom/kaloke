'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const product = PRODUCTS.find(p => p.id === resolvedParams.productId)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/register?plan=${resolvedParams.productId}`)
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('has_access')
        .eq('id', user.id)
        .single()

      if (profile?.has_access) {
        router.push('/dashboard')
        return
      }

      setUserId(user.id)
      setLoading(false)
    }

    checkAuth()
  }, [resolvedParams.productId, router])

  const fetchClientSecret = useCallback(async () => {
    if (!userId || !product) throw new Error('Missing data')

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: resolvedParams.productId,
        userId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Error al crear la sesion de pago')
      throw new Error(data.error)
    }

    return data.clientSecret
  }, [userId, product, resolvedParams.productId])

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-bold text-foreground">{'Plan no encontrado'}</h1>
        <p className="text-muted-foreground">{'El plan seleccionado no existe.'}</p>
        <Link href="/inscribete">
          <Button>{'Ver planes disponibles'}</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{'Preparando checkout...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png"
              alt="DigiCash Academy"
              className="h-10 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-xl font-light tracking-wide text-foreground">{'DigiCash Academy'}</span>
          </Link>
          <Link href="/inscribete">
            <Button variant="ghost" className="gap-2 font-light">
              <ArrowLeft className="h-4 w-4" />
              {'Volver'}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light text-foreground">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {product.type === 'subscription'
                ? `$${(product.priceInCents / 100).toFixed(2)}/mes`
                : `$${(product.priceInCents / 100).toLocaleString('en-US')} - Pago unico`
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            {userId && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>{'Pago seguro procesado por Stripe'}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
