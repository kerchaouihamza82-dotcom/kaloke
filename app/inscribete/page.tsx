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

const MENSUAL_BENEFITS: string[] = [
  "Acceso a los 5 campus especializados",
  "Contenido actualizado diariamente a las 8 a.m.",
  "Comunidad privada de mas de 100 estudiantes",
  "Recursos descargables y plantillas",
  "Acceso a llamadas en vivo y mentorias",
  "Soporte prioritario",
  "Sin permanencia, cancela cuando quieras",
]

const ANUAL_BENEFITS: string[] = [
  "Todo lo del plan mensual",
  "Acceso durante 12 meses completos",
  "Todas las actualizaciones del año incluidas",
  "Sesiones de mentoría 1 a 1 mensuales",
  "Acceso prioritario a nuevos campus",
  "Certificados de finalización",
  "Grupo VIP exclusivo",
  "Ahorra más de $1,500 al año frente al mensual",
]

function InscribetePage() {
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
      toast.error(err?.message || 'No se pudo iniciar el pago, intenta nuevamente')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-light tracking-wide">DigiCash Academy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="font-light">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 font-light">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 space-y-4 text-center">
            <h1 className="text-5xl font-light tracking-tight">Elige tu plan</h1>
            <p className="text-lg font-light text-muted-foreground">
              Paga y accede de inmediato. Sin necesidad de crear cuenta primero.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Plan Mensual */}
            <Card className="relative flex flex-col border-2 border-blue-500/40">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white">
                  Recomendado
                </Badge>
              </div>
              <CardContent className="flex flex-col gap-6 p-8 pt-10">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-blue-400">Plan Mensual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light">$9.99</span>
                    <span className="text-xl text-muted-foreground">/ mes</span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">Cancela cuando quieras</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {MENSUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-blue-600 py-5 text-base hover:bg-blue-700"
                  disabled={!!loadingPlan}
                  onClick={() => handlePlan('mensual')}
                >
                  {loadingPlan === 'mensual'
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirigiendo...</>
                    : 'Empezar mensual'}
                </Button>
              </CardContent>
            </Card>

            {/* Plan Anual */}
            <Card className="flex flex-col border-2 border-border">
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-muted-foreground">Plan Completo Anual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light">$2,500</span>
                    <span className="text-xl text-muted-foreground">/ año</span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">Equivale a solo $208 al mes</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {ANUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full border-foreground py-5 text-base hover:bg-foreground hover:text-background"
                  disabled={!!loadingPlan}
                  onClick={() => handlePlan('anual')}
                >
                  {loadingPlan === 'anual'
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirigiendo...</>
                    : 'Empezar anual'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-light text-muted-foreground">
            &copy; 2024 DigiCash Academy. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default InscribetePage


const PRODUCT_IDS: Record<string, string> = {
  mensual: 'plan-mensual',
  anual: 'plan-completo',
}

const MENSUAL_BENEFITS: string[] = [
  "Acceso a los 5 campus especializados",
  "Contenido actualizado diariamente a las 8 a.m.",
  "Comunidad privada de mas de 100 estudiantes",
  "Recursos descargables y plantillas",
  "Acceso a llamadas en vivo y mentorias",
  "Soporte prioritario",
  "Sin permanencia, cancela cuando quieras",
]

const ANUAL_BENEFITS: string[] = [
  "Todo lo del plan mensual",
  "Acceso durante 12 meses completos",
  "Todas las actualizaciones del año incluidas",
  "Sesiones de mentoría 1 a 1 mensuales",
  "Acceso prioritario a nuevos campus",
  "Certificados de finalización",
  "Grupo VIP exclusivo",
  "Ahorra más de $1,500 al año frente al mensual",
]

function InscribetePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'anual' | null>(null)

  const onSelectPlan = (plan: 'mensual' | 'anual') => {
    setSelectedPlan(plan)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return
    if (!email || !email.includes('@')) {
      toast.error('Introduce un email válido')
      return
    }

    setLoadingPlan(selectedPlan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: PRODUCT_IDS[selectedPlan], email }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        toast.error(data?.error || 'No se pudo iniciar el pago')
        return
      }

      window.location.assign(data.url)
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar el pago, intenta nuevamente')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-light tracking-wide">DigiCash Academy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="font-light">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 font-light">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 space-y-4 text-center">
            <h1 className="text-5xl font-light tracking-tight">Elige tu plan</h1>
            <p className="text-lg font-light text-muted-foreground">
              Paga y accede de inmediato. Sin necesidad de crear cuenta primero.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Plan Mensual */}
            <Card
              className={`relative flex flex-col border-2 cursor-pointer transition-all ${selectedPlan === 'mensual' ? 'border-blue-500' : 'border-blue-500/40'}`}
              onClick={() => onSelectPlan('mensual')}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white">
                  Recomendado
                </Badge>
              </div>
              <CardContent className="flex flex-col gap-6 p-8 pt-10">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-blue-400">Plan Mensual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light">$9.99</span>
                    <span className="text-xl text-muted-foreground">/ mes</span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">Cancela cuando quieras</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {MENSUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                {selectedPlan !== 'mensual' && (
                  <Button
                    className="w-full bg-blue-600 py-5 text-base hover:bg-blue-700"
                    onClick={e => { e.stopPropagation(); onSelectPlan('mensual') }}
                  >
                    Elegir este plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Plan Anual */}
            <Card
              className={`flex flex-col border-2 cursor-pointer transition-all ${selectedPlan === 'anual' ? 'border-foreground' : 'border-border'}`}
              onClick={() => onSelectPlan('anual')}
            >
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-muted-foreground">Plan Completo Anual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light">$2,500</span>
                    <span className="text-xl text-muted-foreground">/ año</span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">Equivale a solo $208 al mes</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {ANUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                {selectedPlan !== 'anual' && (
                  <Button
                    variant="outline"
                    className="w-full border-foreground py-5 text-base hover:bg-foreground hover:text-background"
                    onClick={e => { e.stopPropagation(); onSelectPlan('anual') }}
                  >
                    Elegir este plan
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulario de email — aparece al seleccionar un plan */}
          {selectedPlan && (
            <div className="mx-auto mt-12 max-w-md">
              <Card className="border-2 border-primary">
                <CardContent className="p-8">
                  <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="space-y-1 text-center">
                      <h3 className="text-lg font-light">
                        {selectedPlan === 'mensual' ? 'Plan Mensual — $9.99/mes' : 'Plan Anual — $2,500/año'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Introduce tu email para continuar al pago
                      </p>
                    </div>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    <Button type="submit" className="w-full py-5 text-base" disabled={!!loadingPlan}>
                      {loadingPlan
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirigiendo al pago...</>
                        : 'Continuar al pago seguro'}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Pago 100% seguro con Stripe. Recibirás acceso inmediato tras el pago.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-light text-muted-foreground">
            &copy; 2024 DigiCash Academy. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default InscribetePage
