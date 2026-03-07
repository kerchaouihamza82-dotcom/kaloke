'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

const PRODUCT_IDS: Record<string, string> = {
  mensual: 'plan-mensual',
  anual: 'plan-completo',
}

const MENSUAL_BENEFITS: string[] = [
  "Acceso completo a los 5 campus especializados",
  "Contenido nuevo cada semana con estrategias actuales",
  "Comunidad privada de emprendedores para aprender y conectar",
  "Plantillas, recursos y herramientas listas para usar",
  "Mentorías grupales y sesiones en vivo para resolver dudas",
  "Soporte dentro de la plataforma cuando lo necesites",
  "Garantía de devolución de 7 días",
]

const ANUAL_BENEFITS: string[] = [
  "Incluye todo lo del plan mensual durante 12 meses completos",
  "Mentoría privada 1 a 1 cada mes para trabajar tu negocio",
  "Auditoría estratégica completa para detectar oportunidades",
  "Plan de crecimiento personalizado paso a paso",
  "Revisión de campañas y estrategias con feedback directo",
  "Biblioteca premium de recursos, sistemas y funnels",
  "Grupo VIP exclusivo de networking estratégico",
  "Acceso prioritario a nuevos campus, programas y actualizaciones",
]

const CHECKOUT_URL = '/api/checkout'

function InscribetePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const onSelectPlan = async (plan: 'mensual' | 'anual') => {
    if (!user) {
      localStorage.setItem('pendingProductId', PRODUCT_IDS[plan])
      localStorage.setItem('pendingPlan', plan)
      window.location.href = `/registro?plan=${plan}`
      return
    }

    setLoadingPlan(plan)
    try {
      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: PRODUCT_IDS[plan] }),
        credentials: 'include', // envía las cookies de sesión al servidor
      })

      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { /* non-JSON */ }

      if (!res.ok || !data?.url) {
        toast.error(data?.error || `Error ${res.status}: no se pudo iniciar el pago`)
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
            {user === undefined ? null : user ? (
              <span className="text-sm font-light text-muted-foreground">{user.email}</span>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-light">
                  Iniciar sesi\u00f3n
                </Button>
              </Link>
            )}
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
              {user
                ? 'Selecciona el plan que mejor se adapte a ti'
                : 'Crea una cuenta para acceder a la academia'}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Plan Mensual */}
            <Card className="relative flex flex-col border-2 border-blue-500/40">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white">
                  Plan Mensual
                </Badge>
              </div>
              <CardContent className="flex flex-col gap-6 p-8 pt-10">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-blue-400">Plan Mensual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light">$9.99</span>
                    <span className="text-xl text-muted-foreground">/ mes</span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
                </div>

                <ul className="flex-1 space-y-3">
                  {MENSUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 py-5 text-base hover:bg-blue-700"
                    onClick={() => onSelectPlan('mensual')}
                    disabled={loadingPlan === 'mensual'}
                  >
                    {loadingPlan === 'mensual'
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                      : 'Elegir este plan'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Garantía de devolución de 7 días</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Completo */}
            <Card className="relative flex flex-col border-2 border-white/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-600 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white">
                  Plan Recomendado
                </Badge>
              </div>
              <CardContent className="flex h-full flex-col gap-6 p-8 pt-10">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-white/90">Plan Completo Anual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light">$2,500</span>
                    <span className="text-xl text-muted-foreground">/ año</span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">Equivale a solo $208 al mes</p>
                  <p className="text-sm font-light text-green-400">Valor real superior a $7,000</p>
                </div>

                <ul className="flex-1 space-y-3">
                  {ANUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-white/30 py-5 text-base text-white hover:bg-white hover:text-background"
                    onClick={() => onSelectPlan('anual')}
                    disabled={loadingPlan === 'anual'}
                  >
                    {loadingPlan === 'anual'
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                      : 'Elegir este plan'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Renovación anual automática, cancela antes de que venza</p>
                </div>
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
