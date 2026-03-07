'use client'

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Zap,
  Brain,
  DollarSign,
  Globe,
  MessageSquare,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { VideoCarousel } from "@/components/video-carousel"
import { ImageCarousel } from "@/components/image-carousel"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthNavButton } from "@/components/auth-nav-button"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubscription = async (plan: 'mensual' | 'anual') => {
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
    } catch (err: any) {
      toast.error('Error de conexión')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-10 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-lg font-medium">DigiCash Academy</span>
          </div>
          <nav className="hidden items-center gap-6 lg:flex">
            <a href="#inicio" className="text-sm font-medium transition-colors hover:text-blue-400">Inicio</a>
            <a href="#profesiones" className="text-sm font-medium transition-colors hover:text-blue-400">Profesiones</a>
            <a href="#reseñas" className="text-sm font-medium transition-colors hover:text-blue-400">Reseñas</a>
            <a href="#información" className="text-sm font-medium transition-colors hover:text-blue-400">Información</a>
            <AuthNavButton />
            <ThemeToggle />
            <Link href="/pricing">
              <Button className="h-10 bg-red-600 px-6 font-medium transition-transform hover:scale-105">
                {'Inscríbete Ahora'}
              </Button>
            </Link>
          </nav>
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <Link href="/pricing">
              <Button className="h-10 bg-red-600 px-4 transition-transform hover:scale-105">Inscríbete</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden pt-24 sm:pt-32">
        <div className="container mx-auto px-4 py-16 sm:px-6 md:py-24 lg:py-32">
          <div className="mx-auto max-w-6xl space-y-8 text-center sm:space-y-12">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="relative inline-block text-foreground">
                  GANA DINERO{" "}
                  <span className="relative inline-block">
                    HOY
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-600 sm:h-1"></span>
                  </span>
                </span>
              </h1>
              <p className="mx-auto max-w-3xl px-4 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
                {'La educación moderna es demasiado lenta—cuatro años es demasiado tiempo.'}
              </p>
              <p className="mx-auto max-w-3xl px-4 text-sm leading-relaxed text-foreground/80 sm:text-base md:text-lg">
                Aprende habilidades{" "}
                <span className="relative inline-block font-bold text-foreground">
                  REALES HOY
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-600"></span>
                </span>{" "}
                que te harán ganar dinero{" "}
                <span className="relative inline-block font-bold text-foreground">
                    {'MAÑANA'}
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-600"></span>
                </span>
              </p>
            </div>

            {/* Video VSL */}
            <div className="mx-auto max-w-4xl overflow-hidden rounded-xl shadow-2xl shadow-blue-500/10 ring-1 ring-white/10 sm:rounded-2xl">
              <video 
                controls 
                className="w-full"
                playsInline
                preload="metadata"
              >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VSL_v2%20%281%29-JoZvEKb3RqhOkT2JMKF8zzumN1yLBj.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>

            <div className="mt-10 sm:mt-16">
              <Link href="/inscribete">
                <Button size="lg" className="h-12 bg-red-600 px-8 text-sm font-medium transition-transform hover:scale-105 sm:h-14 sm:px-12 sm:text-base">
                  Empieza hoy
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-4 pt-8 sm:gap-8 sm:pt-12 md:grid-cols-4">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-3xl font-bold text-blue-400 sm:text-4xl">25</div>
                <div className="text-xs font-medium text-muted-foreground sm:text-sm">Estudiantes Inscritos</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-3xl font-bold text-blue-400 sm:text-4xl">17</div>
                <div className="text-xs font-medium text-muted-foreground sm:text-sm">Historias de Éxito</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-3xl font-bold text-blue-400 sm:text-4xl">5</div>
                <div className="text-xs font-medium text-muted-foreground sm:text-sm">Métodos de Creación de Riqueza</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-3xl font-bold text-blue-400 sm:text-4xl">25</div>
                <div className="text-xs font-medium text-muted-foreground sm:text-sm">Estudiantes Activos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mensaje de Conciencia */}
      <section className="border-y border-white/5 py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-6 text-center sm:space-y-8">
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {'El mundo digital avanza más rápido que la educación tradicional'}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {'Actualizamos el contenido cada día a las 8 a.m. para mantener a los estudiantes al día con las últimas herramientas digitales, automatización e inteligencia artificial aplicadas a negocios online.'}
            </p>
            <p className="text-sm font-medium text-blue-400 sm:text-base">
                  {'Información práctica. Resultados reales. Sin teoría innecesaria.'}
                </p>
                <div className="mt-6 sm:mt-8">
                  <Link href="/inscribete">
                    <Button size="lg" className="h-11 bg-red-600 px-8 text-sm font-medium transition-transform hover:scale-105 sm:h-12 sm:px-10 sm:text-base">
                      Empieza ahora
                    </Button>
                  </Link>
                </div>
          </div>
        </div>
      </section>

      {/* Accede a 5 Campus */}
      <section id="profesiones" className="py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 space-y-3 text-center sm:mb-16 sm:space-y-4">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">Accede a 5 campus especializados</h2>
            <p className="text-base font-medium text-muted-foreground sm:text-lg">Habilidades que puedes aplicar de inmediato</p>
          </div>
          
          <div className="mx-auto grid max-w-6xl gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
              <CardContent className="flex flex-col gap-4 p-6 sm:gap-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                  <Brain className="h-6 w-6 text-blue-400 sm:h-7 sm:w-7" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl font-semibold sm:text-2xl">Agencia Automatizada con IA</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Crea sistemas automatizados que puedes ofrecer a negocios online o usar para tu propio proyecto.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
              <CardContent className="flex flex-col gap-4 p-6 sm:gap-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                  <Users className="h-6 w-6 text-blue-400 sm:h-7 sm:w-7" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl font-semibold sm:text-2xl">Campus de Instagram</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Estrategias de venta online sin necesidad de mostrar tu rostro.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
              <CardContent className="flex flex-col gap-4 p-6 sm:gap-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                  <Zap className="h-6 w-6 text-blue-400 sm:h-7 sm:w-7" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl font-semibold sm:text-2xl">Adquisición de Clientes Automatizada</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Sistemas eficientes para conseguir y mantener clientes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-transform duration-300 group-hover:scale-110">
                  <Globe className="h-7 w-7 text-blue-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">Bolsa de Trabajo Experta</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {'Acceso a comunidad, mentorías y oportunidades de colaboración.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 md:col-span-2">
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-transform duration-300 group-hover:scale-110">
                  <DollarSign className="h-7 w-7 text-blue-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">Campus adicional</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Acceso a contenido especializado y recursos exclusivos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plataforma Personalizada */}
      <section className="border-y border-white/5 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              {'Una plataforma diseñada para tu progreso'}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {'Nuestra plataforma está diseñada para facilitar el aprendizaje práctico, el seguimiento del progreso y la aplicación inmediata de lo aprendido.'}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios en Video */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mb-16 space-y-6 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              Logros dentro de DigiCash Academy
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Conoce las historias de estudiantes que han transformado sus vidas aplicando lo aprendido.
            </p>
          </div>

          <VideoCarousel
            videos={[
              { id: "nJSlxXc6RrM", title: "Testimonio 1" },
              { id: "r1tYJ6loZXU", title: "Testimonio 2" },
              { id: "wHqnIV7CD5I", title: "Testimonio 3" }
            ]}
          />
        </div>
      </section>

      {/* Prueba Social - Resultados Reales */}
      <section id="reseñas" className="border-y border-white/5 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mb-16 space-y-6 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              Resultados verificables
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {'Métricas reales de cuentas gestionadas por estudiantes que aplicaron lo aprendido en DigiCash Academy.'}
            </p>
          </div>

          {/* Resultados Reales - Carrusel de Imágenes */}
          <div className="mb-12">
            <ImageCarousel
              images={[
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%282%29-RdT0lMNaDXSfFqnm5vdJvaVkt492lQ.png",
                  alt: "2.2M cuentas alcanzadas"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%281%29-WYuptIkHwaNUicmiGVB4MGRcaR2bCj.png",
                  alt: "12.8M cuentas alcanzadas"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%288%29-Yw6qupx9FT3ulDrtHqkYnNV76I6h6m.png",
                  alt: "284.1 mil visualizaciones"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%286%29-Xl7upPzVNw4wnQ1AvBDDJaBicxnJKL.png",
                  alt: "10,946 seguidores con 8.9% crecimiento"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%284%29-FnbGZLeaA5KtsSeEvm4NmlqoCy1IfO.png",
                  alt: "39M visualizaciones"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%287%29-AvaVsazfRe04h8VTYS1eHY17dpEbLV.png",
                  alt: "14.1M cuentas alcanzadas"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%285%29-1INhzzj2sz8i6Svpe1oXN5WL1F2wN1.png",
                  alt: "4.4M visualizaciones en 30 días"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY-cwAK7G1GJdC5fPqZ6xtJacsTi9D0E1.png",
                  alt: "556K cuentas interactuaron"
                },
                {
                  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIGICASH%20ACADEMY%20%283%29-Zj7sCHuzYoQEP3YNPkRlxWG8Nhimxo.png",
                  alt: "Gráfico de crecimiento de seguidores"
                }
              ]}
            />
          </div>

          <div className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
            {'Datos extraídos directamente de Instagram Analytics. Estas son métricas reales de cuentas manejadas por estudiantes.'}
          </p>
          <div className="mt-12">
            <Link href="/inscribete">
              <Button size="lg" className="h-12 bg-red-600 px-10 text-base font-medium transition-transform hover:scale-105">
                Acceder ahora
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Habilidad Digital */}
      <section id="información" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-16 text-center text-4xl font-bold leading-tight md:text-5xl">
              Generar ingresos online es una habilidad que se aprende
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 transition-transform duration-300 group-hover:scale-110">
                    <CheckCircle className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Plataforma de aprendizaje personalizada</h3>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 transition-transform duration-300 group-hover:scale-110">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Aplicación práctica inmediata</h3>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 transition-transform duration-300 group-hover:scale-110">
                    <MessageSquare className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Red privada de estudiantes</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Red Privada */}
      <section className="border-y border-white/5 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Una comunidad privada de estudiantes enfocados
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Conecta con otros estudiantes, comparte conocimientos y colabora en proyectos reales.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">Elige tu acceso</h2>
            <p className="text-lg font-medium text-muted-foreground">Empieza hoy a desarrollar habilidades digitales rentables</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
            {/* Plan Mensual */}
            <Card className="relative flex flex-col overflow-hidden border-2 border-blue-500/60 bg-gradient-to-b from-blue-950/20 to-background shadow-2xl shadow-blue-500/10">
              <div className="absolute right-4 top-4">
                <Badge className="bg-blue-500 text-xs font-semibold text-white">Más Popular</Badge>
              </div>
              <CardContent className="flex flex-1 flex-col p-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-blue-500 dark:text-blue-400">Suscripción Mensual</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-300">$9.99</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-blue-500/70 dark:text-blue-400/70">Cancela cuando quieras</p>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <span className="text-foreground/80">Acceso a todos los campus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <span className="text-foreground/80">Red privada de estudiantes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <span className="text-foreground/80">Actualizaciones diarias</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <span className="text-foreground/80">Cancela cuando quieras</span>
                  </li>
                </ul>
                <div className="mt-auto pt-8">
                  <Button
                    className="h-12 w-full bg-blue-500 font-medium text-white transition-transform hover:scale-105 hover:bg-blue-400"
                    onClick={async () => {
                      try { await handleSubscription('mensual') }
                      catch (e: any) { toast.error(e.message) }
                    }}
                  >
                    Elegir este plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plan Anual */}
            <Card className="relative flex flex-col overflow-hidden border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/20 to-background shadow-2xl shadow-amber-500/10">
              <div className="absolute right-4 top-4">
                <Badge className="bg-amber-500 text-xs font-semibold text-black">Mejor Valor</Badge>
              </div>
              <CardContent className="flex flex-1 flex-col p-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-amber-600 dark:text-amber-400">Plan Completo Anual</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-amber-700 dark:text-amber-300">$2,500</span>
                    <span className="text-muted-foreground">/año</span>
                  </div>
                  <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Equivale a solo $208 al mes</p>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <span className="text-foreground/80">Acceso durante 12 meses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <span className="text-foreground/80">Acceso a todos los campus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <span className="text-foreground/80">Red privada de estudiantes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <span className="text-foreground/80">Actualizaciones diarias</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <span className="text-foreground/80">Futuros campus incluidos</span>
                  </li>
                </ul>
                <div className="mt-auto pt-8">
                  <Button
                    className="h-12 w-full bg-amber-500 font-medium text-black transition-transform hover:scale-105 hover:bg-amber-400"
                    onClick={async () => {
                      try { await handleSubscription('anual') }
                      catch (e: any) { toast.error(e.message) }
                    }}
                  >
                    Elegir este plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-white/5 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
            Preguntas frecuentes
          </h2>
          
          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: "¿Qué incluye la membresía?",
                a: "Acceso completo a todos los campus especializados, red privada de estudiantes, actualizaciones diarias de contenido, y material práctico aplicable inmediatamente."
              },
              {
                q: "¿Puedo cancelar mi suscripción en cualquier momento?",
                a: "Sí, puedes cancelar tu suscripción mensual en cualquier momento sin penalizaciones. El acceso completo es de por vida, sin necesidad de renovación."
              },
              {
                q: "¿Necesito experiencia previa?",
                a: "No, los campus están diseñados para cualquier nivel de experiencia. Comenzamos desde cero y avanzamos hasta habilidades rentables."
              },
              {
                q: "¿Cuándo puedo empezar a generar ingresos?",
                a: "Depende de tu dedicación y aplicación. Muchos estudiantes empiezan a ver resultados aplicando lo aprendido en las primeras semanas."
              }
            ].map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full rounded-xl border border-border bg-card p-6 text-left transition-all duration-300 hover:border-blue-500/30"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">{faq.q}</h3>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-blue-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <p className="mt-4 leading-relaxed text-muted-foreground">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Empieza a desarrollar habilidades digitales rentables hoy
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {'Únete a estudiantes que están construyendo su futuro digital.'}
          </p>
          <div className="mt-16">
            <Link href="/inscribete">
              <Button size="lg" className="h-14 bg-red-600 px-12 text-base font-medium transition-transform hover:scale-105">
                  {'Inscríbete ahora'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
                alt="DigiCash Academy" 
                className="h-8 object-contain"
                style={{ width: 'auto' }}
              />
              <span className="text-sm font-medium">DigiCash Academy</span>
            </div>
            <div className="flex gap-6">
              <a href="#inicio" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Inicio</a>
              <a href="#profesiones" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Profesiones</a>
              <a href="#reseñas" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Reseñas</a>
              <a href="#información" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Información</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 DigiCash Academy. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
