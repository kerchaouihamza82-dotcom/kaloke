'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function InscribetePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-10 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-xl font-light tracking-wide">DigiCash Academy</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-light">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Title */}
          <div className="mb-20 space-y-4 text-center">
            <h1 className="text-5xl font-light md:text-6xl">
              Elige tu plan
            </h1>
            <p className="text-lg font-light text-gray-400">
              Comienza a aprender habilidades digitales rentables hoy
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Plan Mensual */}
            <Card className="relative border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-gray-950">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 px-6 py-2 text-sm font-medium text-white">
                  RECOMENDADO
                </Badge>
              </div>
              <CardContent className="space-y-8 p-10 pt-12">
                {/* Header */}
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-light text-blue-400">Plan Mensual</h2>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-light text-blue-500">$9.99</span>
                    <span className="text-2xl font-light text-gray-500">/ mes</span>
                  </div>
                  <p className="font-light text-gray-400">
                    Cancela cuando quieras
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-lg font-light">Lo que incluye:</h3>
                  <ul className="space-y-3">
                    {[
                      "Acceso a los 5 campus especializados",
                      "Contenido actualizado diariamente a las 8 a.m.",
                      "Comunidad privada de más de 100 estudiantes",
                      "Recursos descargables y plantillas",
                      "Acceso a llamadas en vivo y mentorías",
                      "Soporte prioritario",
                      "Sin permanencia, cancela cuando quieras"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-blue-500" />
                        <span className="font-light text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button 
                  className="w-full bg-red-600 py-6 text-lg font-medium hover:bg-red-700"
                  onClick={() => alert('Próximamente: Integración con Stripe')}
                >
                  Acceder ahora
                </Button>

                <p className="text-center text-sm font-light text-gray-500">
                  7 días de garantía de devolución
                </p>
              </CardContent>
            </Card>

            {/* Plan Completo */}
            <Card className="border border-white/5 bg-gray-950">
              <CardContent className="space-y-8 p-10">
                {/* Header */}
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-light text-gray-400">Plan Completo</h2>
                  <div className="text-7xl font-light">$2,500</div>
                  <p className="font-light text-gray-500">
                    Pago único, acceso de por vida
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-lg font-light">Lo que incluye:</h3>
                  <ul className="space-y-3">
                    {[
                      "Todo lo del plan mensual",
                      "Acceso de por vida a todos los campus",
                      "Todas las actualizaciones futuras incluidas",
                      "Sesiones de mentoría 1 a 1 mensuales",
                      "Acceso prioritario a nuevos campus",
                      "Certificados de finalización",
                      "Grupo VIP exclusivo",
                      "Ahorra más de $1,500 al año"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-white" />
                        <span className="font-light text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button 
                  className="w-full border border-white bg-white py-6 text-lg font-medium text-black hover:bg-gray-200"
                  onClick={() => alert('Próximamente: Integración con Stripe')}
                >
                  Acceder ahora
                </Button>

                <p className="text-center text-sm font-light text-gray-500">
                  Pago único, sin cargos recurrentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Signals */}
          <div className="mt-20 space-y-8 text-center">
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">25+</div>
                <p className="font-light text-gray-500">Estudiantes activos</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">5</div>
                <p className="font-light text-gray-500">Campus especializados</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">100%</div>
                <p className="font-light text-gray-500">Satisfacción garantizada</p>
              </div>
            </div>

            <p className="text-lg font-light text-gray-400">
              ¿Tienes preguntas? <Link href="/#faq" className="text-blue-500 hover:underline">Consulta nuestras FAQ</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
                alt="DigiCash Academy" 
                className="h-8 object-contain"
                style={{ width: 'auto' }}
              />
              <span className="font-light">DigiCash Academy</span>
            </div>
            <p className="text-sm font-light text-gray-500">
              © 2024 DigiCash Academy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
