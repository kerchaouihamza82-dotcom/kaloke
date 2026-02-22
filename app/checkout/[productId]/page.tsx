'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkout } from '@/components/checkout'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const product = PRODUCTS.find(p => p.id === resolvedParams.productId)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to signup with product ID
        router.push(`/auth/sign-up?product=${resolvedParams.productId}`)
        return
      }
      
      setUserId(user.id)
      setLoading(false)
    }

    checkAuth()
  }, [resolvedParams.productId, router, supabase])

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <Link href="/inscribete">
          <Button>Volver a planes</Button>
        </Link>
      </div>
    )
  }

  if (loading || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando...</p>
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

      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>

          <Checkout productId={resolvedParams.productId} userId={userId} />
        </div>
      </main>
    </div>
  )
}
