'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (!searchParams.get('session_id')) {
      router.push('/inscribete')
      return
    }
    // Redirigir al dashboard tras 3 segundos
    const t = setTimeout(() => router.push('/dashboard'), 3000)
    return () => clearTimeout(t)
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pb-12 pt-12 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-3xl font-light">¡Pago exitoso!</h1>
          <p className="mb-8 text-muted-foreground">
            Tu suscripción ha sido activada. Redirigiendo al dashboard...
          </p>
          <Link href="/dashboard">
            <Button className="w-full" size="lg">
              Ir al Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
