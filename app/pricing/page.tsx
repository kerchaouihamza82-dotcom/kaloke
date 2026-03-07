'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const subscribe = async (plan: 'mensual' | 'anual') => {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: plan === 'mensual' ? 'plan-mensual' : 'plan-completo' 
        }),
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
            <p className="mt-4 text-lg text-muted-foreground">Paga y accede de inmediato. Sin necesidad de crear cuenta primero.</p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            {/* Plan Mensual */}
            <Card className="relative flex flex-col overflow-hidden border-2 border-blue-500/60 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-950/30">
              <div className="absolute -top-0 left-0 right-0 flex justify-center pt-4">
                <Badge className="bg-blue-500 px-4 py-1 text-sm font-medium text-white">Recomendado</Badge>
              </div>
              <CardContent className="flex flex-1 flex-col p-8 pt-14">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-medium text-blue-600 dark:text-blue-400">Plan Mensual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light text-foreground">$9.99</span>
                    <span className="text-xl text-muted-foreground">/ mes</span>
                  </div>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Cancela cuando quieras</p>
                </div>
                <ul className="my-8 flex-1 space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-foreground/80">Acceso a todos los campus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-foreground/80">Contenido actualizado diariamente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-foreground/80">Comunidad privada de estudiantes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-foreground/80">Soporte prioritario</span>
                  </li>
                </ul>
                <Button 
                  className="mt-auto w-full bg-blue-500 py-6 text-base font-medium text-white hover:bg-blue-600" 
                  disabled={!!loading}
                  onClick={() => subscribe('mensual')}
                >
                  {loading === 'mensual' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Elegir este plan
                </Button>
              </CardContent>
            </Card>

            {/* Plan Anual */}
            <Card className="relative flex flex-col overflow-hidden border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-950/30">
              <div className="absolute -top-0 left-0 right-0 flex justify-center pt-4">
                <Badge className="bg-amber-500 px-4 py-1 text-sm font-medium text-black">Mejor valor</Badge>
              </div>
              <CardContent className="flex flex-1 flex-col p-8 pt-14">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-medium text-amber-600 dark:text-amber-400">Plan Completo Anual</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-light text-foreground">$2,500</span>
                    <span className="text-xl text-muted-foreground">/ año</span>
                  </div>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">Equivale a solo $208 al mes</p>
                </div>
                <ul className="my-8 flex-1 space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-foreground/80">Todo lo del plan mensual</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-foreground/80">Acceso durante 12 meses completos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-foreground/80">Sesiones de mentoría 1 a 1</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-foreground/80">Ahorra más de $1,500 al año</span>
                  </li>
                </ul>
                <Button 
                  className="mt-auto w-full bg-amber-500 py-6 text-base font-medium text-black hover:bg-amber-400" 
                  disabled={!!loading}
                  onClick={() => subscribe('anual')}
                >
                  {loading === 'anual' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Elegir este plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">DigiCash Academy {new Date().getFullYear()}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
