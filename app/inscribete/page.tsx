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

const PRICE_IDS: Record<string, string> = {
  mensual: 'price_1T7cBgGXPveWbaAfVlivnMcG',
  anual: 'price_1T7cE1GXPveWbaAfZHbjhuxj',
}

// All strings are pure ASCII — no multibyte characters to avoid SSR/client encoding mismatch
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
  "Acceso de por vida a todos los campus",
  "Todas las actualizaciones futuras incluidas",
  "Sesiones de mentoria 1 a 1 mensuales",
  "Acceso prioritario a nuevos campus",
  "Certificados de finalizacion",
  "Grupo VIP exclusivo",
  "Ahorra mas de $1,500 al ano",
]

const CHECKOUT_URL = 'https://uwjjtmnesnjjqxkiacjt.supabase.co/functions/v1/create-checkout'

// Renders a benefits list only on the client to prevent SSR/client text mismatch
function BenefitsList({ benefits, iconClass }: { benefits: string[], iconClass: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <ul className="flex-1 space-y-3">
        {benefits.map((_, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
            <span className="text-sm font-light text-foreground/80">&nbsp;</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="flex-1 space-y-3">
      {benefits.map((b, i) => (
        <li key={i} className="flex items-start gap-3">
          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
          <span className="text-sm font-light text-foreground/80">{b}</span>
        </li>
      ))}
    </ul>
  )
}

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
      localStorage.setItem('pendingPriceId', PRICE_IDS[plan])
      localStorage.setItem('pendingPlan', plan)
      window.location.href = `/registro?plan=${plan}`
      return
    }

    setLoadingPlan(plan)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token || !session.user?.email || !session.user?.id) {
        toast.error('Sesion expirada. Vuelve a iniciar sesion.')
        window.location.href = '/login'
        return
      }

      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify({
          priceId: PRICE_IDS[plan],
          email: session.user.email,
          userId: session.user.id,
        }),
      })

      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { /* non-JSON */ }

      if (!res.ok || !data?.url) {
        toast.error('No se pudo iniciar el pago, intenta nuevamente')
        return
      }

      window.location.assign(data.url)
    } catch {
      toast.error('No se pudo iniciar el pago, intenta nuevamente')
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
                  Iniciar sesion
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

                <BenefitsList benefits={MENSUAL_BENEFITS} iconClass="text-blue-500" />

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
                  <p className="text-center text-xs text-muted-foreground">7 dias de garantia de devolucion</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Completo */}
            <Card className="flex flex-col border border-border">
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-muted-foreground">Plan Completo</h2>
                  <div className="text-6xl font-light">$2,500</div>
                  <p className="text-sm font-light text-muted-foreground">Pago unico, acceso de por vida</p>
                </div>

                <BenefitsList benefits={ANUAL_BENEFITS} iconClass="text-foreground" />

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-foreground py-5 text-base hover:bg-foreground hover:text-background"
                    onClick={() => onSelectPlan('anual')}
                    disabled={loadingPlan === 'anual'}
                  >
                    {loadingPlan === 'anual'
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                      : 'Elegir este plan'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Pago unico, sin cargos recurrentes</p>
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
      localStorage.setItem('pendingPriceId', PRICE_IDS[plan])
      localStorage.setItem('pendingPlan', plan)
      window.location.href = `/registro?plan=${plan}`
      return
    }

    setLoadingPlan(plan)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token || !session.user?.email || !session.user?.id) {
        toast.error('Sesi\u00f3n expirada. Vuelve a iniciar sesi\u00f3n.')
        window.location.href = '/login'
        return
      }

      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

      const body = JSON.stringify({
        priceId: PRICE_IDS[plan],
        email: session.user.email,
        userId: session.user.id,
      })

      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anon,
        },
        body,
      })

      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { /* non-JSON */ }

      if (!res.ok || !data?.url) {
        toast.error('No se pudo iniciar el pago, intenta nuevamente')
        return
      }

      window.location.assign(data.url)
    } catch {
      toast.error('No se pudo iniciar el pago, intenta nuevamente')
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
                  <p className="text-center text-xs text-muted-foreground">7 d\u00edas de garant\u00eda de devoluci\u00f3n</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Completo */}
            <Card className="flex flex-col border border-border">
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-light text-muted-foreground">Plan Completo</h2>
                  <div className="text-6xl font-light">$2,500</div>
                  <p className="text-sm font-light text-muted-foreground">Pago \u00fanico, acceso de por vida</p>
                </div>

                <ul className="flex-1 space-y-3">
                  {ANUAL_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span className="text-sm font-light text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-foreground py-5 text-base hover:bg-foreground hover:text-background"
                    onClick={() => onSelectPlan('anual')}
                    disabled={loadingPlan === 'anual'}
                  >
                    {loadingPlan === 'anual'
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                      : 'Elegir este plan'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Pago \u00fanico, sin cargos recurrentes</p>
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
