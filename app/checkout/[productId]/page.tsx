'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  const product = PRODUCTS.find(p => p.id === resolvedParams.productId)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/registro?plan=${resolvedParams.productId}`)
        return
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [resolvedParams.productId, router])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: resolvedParams.productId }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data?.url) {
        toast.error(data?.error || 'No se pudo iniciar el pago')
        return
      }
      window.location.assign(data.url)
    } catch (err: any) {
      toast.error(err?.message || 'Error al iniciar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-bold">Plan no encontrado</h1>
        <Link href="/inscribete"><Button>Ver planes disponibles</Button></Link>
      </div>
    )
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <span className="text-xl font-light tracking-wide">DigiCash Academy</span>
          </Link>
          <Link href="/inscribete">
            <Button variant="ghost" className="gap-2 font-light">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md text-center">
          <h1 className="mb-2 text-3xl font-light">{product.name}</h1>
          <p className="mb-8 text-muted-foreground">
            ${(product.priceInCents / 100).toLocaleString('en-US')}
            {product.interval === 'month' ? '/mes' : '/año'}
          </p>

          <Button
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
            ) : 'Continuar al pago'}
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Pago seguro procesado por Stripe</span>
          </div>
        </div>
      </main>
    </div>
  )
}
