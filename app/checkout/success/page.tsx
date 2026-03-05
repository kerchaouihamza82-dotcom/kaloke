'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 30000

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'success' | 'failed'>('loading')

  const pollSessionStatus = useCallback(async (sessionId: string) => {
    const start = Date.now()

    const check = async () => {
      try {
        const res = await fetch(`/api/checkout/session-status?session_id=${sessionId}`)
        const data = await res.json()

        if (data.payment_status === 'paid' || data.status === 'complete') {
          setState('success')
          return
        }

        if (data.status === 'expired') {
          setState('failed')
          return
        }
      } catch {
        // Network error — keep polling
      }

      if (Date.now() - start < POLL_TIMEOUT_MS) {
        setTimeout(check, POLL_INTERVAL_MS)
      } else {
        // Timed out waiting — show success anyway (webhook may still be processing)
        setState('success')
      }
    }

    check()
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.push('/inscribete')
      return
    }
    pollSessionStatus(sessionId)
  }, [searchParams, router, pollSessionStatus])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pb-12 pt-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <h2 className="mb-2 text-2xl font-light">Procesando tu pago...</h2>
            <p className="text-muted-foreground">Esto solo tomará un momento</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pb-12 pt-12 text-center">
            <div className="mb-6 flex justify-center">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="mb-2 text-3xl font-light">Pago no completado</h1>
            <p className="mb-8 text-muted-foreground">
              La sesión de pago expiró o fue cancelada. Puedes intentarlo de nuevo.
            </p>
            <Link href="/inscribete">
              <Button className="w-full" size="lg" variant="outline">
                Volver a los planes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pb-12 pt-12 text-center">
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
