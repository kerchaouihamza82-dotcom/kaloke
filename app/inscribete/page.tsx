'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const PRODUCT_IDS: Record<string, string> = {
  mensual: 'plan-mensual',
  anual: 'plan-completo',
}

const MENSUAL_BENEFITS = [
  "Acceso a los 5 campus especializados",
  "Contenido actualizado diariamente a las 8 a.m.",
  "Comunidad privada de mas de 100 estudiantes",
  "Recursos descargables y plantillas",
  "Acceso a llamadas en vivo y mentorias",
  "Soporte prioritario",
  "Sin permanencia, cancela cuando quieras",
]

const ANUAL_BENEFITS = [
  "Todo lo del plan mensual",
  "Acceso durante 12 meses completos",
  "Todas las actualizaciones del año incluidas",
  "Sesiones de mentoría 1 a 1 mensuales",
  "Acceso prioritario a nuevos campus",
  "Certificados de finalización",
  "Grupo VIP exclusivo",
  "Ahorra más de $1,500 al año frente al mensual",
]

export default function InscribetePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handlePlan = async (plan: 'mensual' | 'anual') => {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: PRODUCT_IDS[plan] }),
      })
      const data = await res.json()
      if (!res.ok || !data?.url) {
        toast.error(data?.error || 'No se pudo iniciar el pago')
        return
      }
      window.location.assign(data.url)
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar el pago')
    } finally {
      setLoadingPlan(null)
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
              <Button variant="outline" size="sm" className="font-light">Iniciar sesión</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 font-light">
                <ArrowLeft className="h-4 w-4" />Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 space-y-4 text-center">
            <h1 className="text-5xl font-light tracking-tight text-balance">Elige tu plan</h1>
            <p className="text-lg font-light text-muted-foreground">
              Paga y accede de inmediato. Sin necesidad de crear cuenta primero.
            </p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            <Card className="relative flex flex-col border-2 border-blue-500/60 bg-gradient-to-b from-blue-950/20 to-background pt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge className="bg-blue-500 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white">
                  Recomendado
                </Badge>
              </div>
              <CardContent className="flex flex-1 flex-col gap-6 p-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-blue-500 dark:text-blue-400">Plan Mensual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light text-blue-600 dark:text-blue-300">$9.99</span>
                    <span className="text-xl text-muted-foreground">/ mes</span>
                  </div>
                  <p className="text-sm font-light text-blue-500/70 dark:text-blue-400/70">Cancela cuando quieras</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {MENSUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-auto w-full border-blue-500 bg-blue-500 py-6 text-base font-normal text-white hover:bg-blue-400"
                  disabled={!!loadingPlan}
                  onClick={() => handlePlan('mensual')}
                >
                  {loadingPlan === 'mensual'
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirigiendo...</>
                    : 'Elegir este plan'}
                </Button>
              </CardContent>
            </Card>

            <Card className="relative flex flex-col border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/20 to-background pt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge className="bg-amber-500 px-5 py-1 text-xs font-medium uppercase tracking-widest text-black">
                  Mejor valor
                </Badge>
              </div>
              <CardContent className="flex flex-1 flex-col gap-6 p-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-amber-600 dark:text-amber-400">Plan Completo Anual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light text-amber-700 dark:text-amber-300">$2,500</span>
                    <span className="text-xl text-muted-foreground">/ año</span>
                  </div>
                  <p className="text-sm font-light text-amber-600/70 dark:text-amber-400/70">Equivale a solo $208 al mes</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {ANUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-auto w-full border-amber-500 bg-amber-500 py-6 text-base font-normal text-black hover:bg-amber-400"
                  disabled={!!loadingPlan}
                  onClick={() => handlePlan('anual')}
                >
                  {loadingPlan === 'anual'
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirigiendo...</>
                    : 'Elegir este plan'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-light text-muted-foreground">
    DigiCash Academy {new Date().getFullYear()}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
