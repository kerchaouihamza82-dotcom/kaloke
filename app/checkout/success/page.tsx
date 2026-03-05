'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      router.push('/inscribete')
      return
    }

    // Simulate processing time to allow webhook to process
    setTimeout(() => {
      setProcessing(false)
    }, 3000)
  }, [searchParams, router])

  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h2 className="mb-2 text-2xl font-light">Procesando tu pago...</h2>
            <p className="text-muted-foreground">Esto solo tomará un momento</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-3xl font-light">¡Pago exitoso!</h1>
          <p className="mb-8 text-muted-foreground">
            Tu suscripción ha sido activada. Ya puedes acceder a todos los contenidos de DigiCash Academy.
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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
