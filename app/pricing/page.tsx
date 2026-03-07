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
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-light tracking-tight">Elige tu plan</h1>
            <p className="mt-4 text-muted-foreground">Accede a todo el contenido de DigiCash Academy</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-2 border-blue-500/50 bg-gradient-to-b from-blue-950/20 to-background">
              <CardContent className="flex flex-col p-8">
                <Badge className="mb-4 w-fit bg-blue-500 text-white">Recomendado</Badge>
                <h2 className="text-xl text-blue-500 dark:text-blue-400">Plan Mensual</h2>
                <div className="my-4">
                  <span className="text-5xl font-light text-blue-600 dark:text-blue-300">$9.99</span>
                  <span className="text-muted-foreground"> /mes</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-blue-500" /> Acceso a todos los campus</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-blue-500" /> Contenido actualizado</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-blue-500" /> Comunidad privada</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-blue-500" /> Cancela cuando quieras</li>
                </ul>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  disabled={!!loading}
                  onClick={() => subscribe('mensual')}
                >
                  {loading === 'mensual' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Elegir este plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-background">
              <CardContent className="flex flex-col p-8">
                <Badge className="mb-4 w-fit bg-amber-500 text-black">Mejor valor</Badge>
                <h2 className="text-xl text-amber-600 dark:text-amber-400">Plan Anual</h2>
                <div className="my-4">
                  <span className="text-5xl font-light text-amber-700 dark:text-amber-300">$2,500</span>
                  <span className="text-muted-foreground"> /año</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-amber-500" /> Todo lo del plan mensual</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-amber-500" /> 12 meses de acceso</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-amber-500" /> Mentorías 1 a 1</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-amber-500" /> Ahorra más de $1,500</li>
                </ul>
                <Button 
                  className="w-full bg-amber-500 text-black hover:bg-amber-400" 
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
    </div>
  )
}
