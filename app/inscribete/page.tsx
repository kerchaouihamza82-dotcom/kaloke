'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const PLANS = [
  {
    id: 'plan-mensual',
    name: 'Plan Mensual',
    price: '$9.99',
    period: '/mes',
    badge: 'Recomendado',
    badgeColor: 'bg-blue-500',
    cardBorder: 'border-blue-500/60',
    cardBg: 'from-blue-500/10',
    titleColor: 'text-blue-600 dark:text-blue-400',
    subtitleColor: 'text-blue-600/80 dark:text-blue-400/80',
    checkColor: 'text-blue-500',
    btnBg: 'bg-blue-500 hover:bg-blue-600',
    btnText: 'text-white',
    subtitle: 'Cancela cuando quieras',
    benefits: [
      'Acceso a todos los campus',
      'Contenido actualizado diariamente',
      'Comunidad privada de estudiantes',
      'Soporte prioritario',
    ],
  },
  {
    id: 'plan-completo',
    name: 'Plan Completo Anual',
    price: '$2,500',
    period: '/año',
    badge: 'Mejor valor',
    badgeColor: 'bg-amber-500 text-black',
    cardBorder: 'border-amber-500/60',
    cardBg: 'from-amber-500/10',
    titleColor: 'text-amber-600 dark:text-amber-400',
    subtitleColor: 'text-amber-600/80 dark:text-amber-400/80',
    checkColor: 'text-amber-500',
    btnBg: 'bg-amber-500 hover:bg-amber-400',
    btnText: 'text-black',
    subtitle: 'Equivale a solo $208 al mes',
    benefits: [
      'Todo lo del plan mensual',
      'Acceso durante 12 meses completos',
      'Sesiones de mentoría 1 a 1',
      'Ahorra más de $1,500 al año',
    ],
  },
]

export default function InscribetePage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: planId }),
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Error al iniciar pago')
      }
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-lg shadow-blue-500/25">
              D
            </div>
            <span className="text-xl font-light tracking-wide">DigiCash Academy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Iniciar sesión</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h1 className="text-5xl font-light tracking-tight">Elige tu plan</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Paga y accede de inmediato. Sin necesidad de crear cuenta primero.
            </p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col overflow-hidden border-2 ${plan.cardBorder} bg-gradient-to-b ${plan.cardBg} to-transparent`}
              >
                <div className="absolute left-0 right-0 top-0 flex justify-center pt-4">
                  <Badge className={`${plan.badgeColor} px-4 py-1 text-sm font-medium`}>
                    {plan.badge}
                  </Badge>
                </div>
                <CardContent className="flex flex-1 flex-col p-8 pt-14">
                  <div className="space-y-2 text-center">
                    <h2 className={`text-2xl font-medium ${plan.titleColor}`}>{plan.name}</h2>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-6xl font-light text-foreground">{plan.price}</span>
                      <span className="text-xl text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className={`text-sm ${plan.subtitleColor}`}>{plan.subtitle}</p>
                  </div>
                  <ul className="my-8 flex-1 space-y-4">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`mt-0.5 h-5 w-5 shrink-0 ${plan.checkColor}`} />
                        <span className="text-foreground/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-auto w-full py-6 text-base font-medium ${plan.btnBg} ${plan.btnText}`}
                    disabled={!!loading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Elegir este plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            DigiCash Academy {new Date().getFullYear()}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
