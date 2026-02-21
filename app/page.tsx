'use client'

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
import { useState, useEffect, useRef } from "react"
import { VideoCarousel } from "@/components/video-carousel"
import { ImageCarousel } from "@/components/image-carousel"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Auto-play and pause on scroll
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Auto-play muted when page loads
    video.muted = true
    video.play().catch(err => console.log('[v0] Video autoplay prevented:', err))

    const handleScroll = () => {
      const rect = video.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0

      if (isVisible && video.paused) {
        video.play().catch(err => console.log('[v0] Video play error:', err))
      } else if (!isVisible && !video.paused) {
        video.pause()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="container mx-auto flex h-24 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-12 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-xl font-medium tracking-tight">DigiCash Academy</span>
          </div>
          <nav className="hidden items-center gap-10 lg:flex">
            <a href="#inicio" className="text-sm font-medium transition-colors hover:text-blue-400">Inicio</a>
            <a href="#profesiones" className="text-sm font-medium transition-colors hover:text-blue-400">Profesiones</a>
            <a href="#reseñas" className="text-sm font-medium transition-colors hover:text-blue-400">Reseñas</a>
            <a href="#información" className="text-sm font-medium transition-colors hover:text-blue-400">Información</a>
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-blue-400">Acceso</Link>
            <Link href="/inscribete">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 px-6 font-semibold shadow-lg shadow-red-600/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-600/50">
                Inscríbete Ahora
              </Button>
            </Link>
          </nav>
          <div className="lg:hidden">
            <Link href="/inscribete">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg hover:scale-105">Inscríbete</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden pt-40">
        <div className="container mx-auto px-6 py-32 md:py-48">
          <div className="mx-auto max-w-6xl space-y-16 text-center">
            <div className="space-y-8">
              <h1 className="bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent md:text-7xl lg:text-8xl">
                Aprende a generar ingresos online
              </h1>
              <p className="mx-auto max-w-3xl text-xl font-normal leading-relaxed text-gray-300 md:text-2xl">
                La educación tradicional avanza demasiado lento. Cuatro años es demasiado tiempo cuando puedes aprender habilidades rentables hoy y aplicarlas mañana.
              </p>
            </div>

            {/* Video VSL */}
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl shadow-2xl shadow-blue-500/20 ring-1 ring-white/10">
              <video 
                ref={videoRef}
                controls 
                className="w-full"
                playsInline
                preload="metadata"
              >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VSL_v2%20%281%29-JoZvEKb3RqhOkT2JMKF8zzumN1yLBj.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>

            <Link href="/inscribete">
              <Button size="lg" className="h-16 bg-gradient-to-r from-red-600 to-red-700 px-14 text-lg font-semibold shadow-2xl shadow-red-600/40 transition-all hover:scale-105 hover:shadow-red-600/60">
                Empieza hoy
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-10 pt-16 md:grid-cols-4">
              <div className="space-y-3">
                <div className="text-5xl font-bold text-blue-400">25</div>
                <div className="text-sm font-medium text-gray-400">Estudiantes Inscritos</div>
              </div>
              <div className="space-y-3">
                <div className="text-5xl font-bold text-blue-400">17</div>
                <div className="text-sm font-medium text-gray-400">Historias de Éxito</div>
              </div>
              <div className="space-y-3">
                <div className="text-5xl font-bold text-blue-400">5</div>
                <div className="text-sm font-medium text-gray-400">Métodos de Creación de Riqueza</div>
              </div>
              <div className="space-y-3">
                <div className="text-5xl font-bold text-blue-400">25</div>
                <div className="text-sm font-medium text-gray-400">Estudiantes Activos</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative gradients */}
        <div className="absolute right-0 top-0 -z-10 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/10 blur-[180px]" />
        <div className="absolute left-0 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-600/10 to-cyan-600/10 blur-[160px]" />
      </section>

      {/* Mensaje de Conciencia */}
      <section className="border-y border-white/5 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-10 text-center">
            <h2 className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-6xl">
              El mundo digital avanza más rápido que la educación tradicional
            </h2>
            <p className="text-xl font-normal leading-relaxed text-gray-300">
              Actualizamos el contenido cada día a las 8 a.m. para mantener a los estudiantes al día con las últimas herramientas digitales, automatización e inteligencia artificial aplicadas a negocios online.
            </p>
            <p className="text-lg font-medium text-blue-400">
              Información práctica. Resultados reales. Sin teoría innecesaria.
            </p>
            <Link href="/inscribete">
              <Button size="lg" className="mt-6 h-14 bg-gradient-to-r from-red-600 to-red-700 px-12 text-base font-semibold shadow-xl shadow-red-600/30 transition-all hover:scale-105 hover:shadow-red-600/50">
                Empieza ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Accede a 5 Campus */}
      <section id="profesiones" className="py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mb-24 space-y-6 text-center">
            <h2 className="text-6xl font-bold">Accede a 5 campus especializados</h2>
            <p className="text-xl font-medium text-gray-400">Habilidades que puedes aplicar de inmediato</p>
          </div>
          
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
            <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
              <CardContent className="space-y-8 p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                  <Brain className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold">Agencia Automatizada con IA</h3>
                  <p className="font-normal leading-relaxed text-gray-400">
                    Crea sistemas automatizados que puedes ofrecer a negocios online o usar para tu propio proyecto.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
              <CardContent className="space-y-8 p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold">Campus de Instagram</h3>
                  <p className="font-normal leading-relaxed text-gray-400">
                    Estrategias de venta online sin necesidad de mostrar tu rostro.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
              <CardContent className="space-y-8 p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold">Adquisición de Clientes Automatizada</h3>
                  <p className="font-normal leading-relaxed text-gray-400">
                    Sistemas eficientes para conseguir y mantener clientes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
              <CardContent className="space-y-8 p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                  <Globe className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold">Bolsa de Trabajo Experta</h3>
                  <p className="font-normal leading-relaxed text-gray-400">
                    Acceso a comunidad, mentorías y oportunidades de colaboración.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20 md:col-span-2">
              <CardContent className="space-y-8 p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                  <DollarSign className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold">Campus adicional</h3>
                  <p className="font-normal leading-relaxed text-gray-400">
                    Acceso a contenido especializado y recursos exclusivos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plataforma Personalizada */}
      <section className="border-y border-white/5 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl space-y-10 text-center">
            <h2 className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-6xl">
              Una plataforma diseñada para tu progreso
            </h2>
            <p className="text-xl font-normal leading-relaxed text-gray-300">
              Nuestra plataforma está diseñada para facilitar el aprendizaje práctico, el seguimiento del progreso y la aplicación inmediata de lo aprendido.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios en Video */}
      <section className="py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mb-24 space-y-8 text-center">
            <h2 className="text-6xl font-bold md:text-7xl">
              Logros dentro de DigiCash Academy
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-normal leading-relaxed text-gray-300">
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
      <section id="reseñas" className="border-y border-white/5 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mb-24 space-y-8 text-center">
            <h2 className="text-6xl font-bold md:text-7xl">
              Resultados verificables
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-normal leading-relaxed text-gray-300">
              Métricas reales de cuentas gestionadas por estudiantes que aplicaron lo aprendido en DigiCash Academy.
            </p>
          </div>

          {/* Resultados Reales - Carrusel de Imágenes */}
          <div className="mb-20">
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

          <div className="space-y-10 text-center">
            <p className="text-xl font-normal text-gray-300">
              Datos extraídos directamente de Instagram Analytics. Estas son métricas reales de cuentas manejadas por estudiantes.
            </p>
            <Link href="/inscribete">
              <Button size="lg" className="h-14 bg-gradient-to-r from-red-600 to-red-700 px-12 text-base font-semibold shadow-xl shadow-red-600/30 transition-all hover:scale-105 hover:shadow-red-600/50">
                Acceder ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Habilidad Digital */}
      <section id="información" className="py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-20 text-center text-5xl font-bold leading-tight md:text-6xl">
              Generar ingresos online es una habilidad que se aprende
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
                <CardContent className="space-y-8 p-12 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                      <CheckCircle className="h-10 w-10 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Plataforma de aprendizaje personalizada</h3>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
                <CardContent className="space-y-8 p-12 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                      <TrendingUp className="h-10 w-10 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Escala desde 0 hasta $1,000/mes en el menor tiempo posible</h3>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
                <CardContent className="space-y-8 p-12 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                      <DollarSign className="h-10 w-10 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Cursos avanzados para aumentar ingresos</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Red Privada */}
      <section className="border-y border-white/5 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl space-y-16 text-center">
            <div className="space-y-8">
              <h2 className="text-6xl font-bold md:text-7xl">
                Red Privada Global
              </h2>
              <p className="text-xl font-normal text-gray-300">
                Colabora, comparte resultados y conecta con otros estudiantes enfocados en crecimiento.
              </p>
            </div>
            
            <div className="grid gap-10 md:grid-cols-2">
              <div className="group space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 p-10 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 transition-all group-hover:scale-110">
                  <MessageSquare className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold">Sesiones de mentoría</h3>
                <p className="font-normal text-gray-400">Acceso a sesiones mensuales donde compartimos estrategias actuales.</p>
              </div>

              <div className="group space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 p-10 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 transition-all group-hover:scale-110">
                  <Users className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold">Red de contactos</h3>
                <p className="font-normal text-gray-400">Conoce a personas con los mismos objetivos y perspectivas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mb-20 space-y-6 text-center">
            <h2 className="text-6xl font-bold">Elige tu plan</h2>
            <p className="text-xl font-normal text-gray-400">Acceso completo a toda la plataforma</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
            <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
              <CardContent className="space-y-8 p-12">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold">Membresía Mensual</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold">$9.99</span>
                    <span className="text-xl font-medium text-gray-400">/mes</span>
                  </div>
                </div>

                <ul className="space-y-5">
                  {[
                    'Acceso a 5 campus especializados',
                    'Actualizaciones diarias de contenido',
                    'Red privada global',
                    'Sesiones de mentoría mensuales',
                    'Soporte prioritario'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-400" />
                      <span className="font-medium text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/inscribete" className="block">
                  <Button size="lg" className="h-14 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-base font-semibold shadow-xl shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-blue-600/50">
                    Acceder ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-blue-500/50 bg-gradient-to-br from-blue-950/30 via-black to-gray-950 shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:shadow-blue-500/50">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-2">
                <span className="text-sm font-bold">MÁS POPULAR</span>
              </div>
              <CardContent className="space-y-8 p-12">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold">Plan Completo</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold">$2,500</span>
                    <span className="text-xl font-medium text-gray-400">/único</span>
                  </div>
                  <p className="text-sm font-medium text-blue-400">Acceso de por vida</p>
                </div>

                <ul className="space-y-5">
                  {[
                    'Todo del plan mensual',
                    'Acceso de por vida sin renovaciones',
                    'Campus futuros incluidos',
                    'Sesiones 1 a 1 exclusivas',
                    'Certificación oficial',
                    'Soporte VIP 24/7'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-400" />
                      <span className="font-medium text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/inscribete" className="block">
                  <Button size="lg" className="h-14 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-base font-semibold shadow-2xl shadow-blue-600/50 transition-all hover:scale-105 hover:shadow-blue-600/70">
                    Acceder ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-white/5 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-16 text-center text-6xl font-bold">Preguntas Frecuentes</h2>
            
            <div className="space-y-6">
              {[
                {
                  q: '¿Necesito experiencia previa?',
                  a: 'No. DigiCash Academy está diseñado para personas que empiezan desde cero. Cada campus incluye lecciones progresivas desde conceptos básicos hasta técnicas avanzadas.'
                },
                {
                  q: '¿Cuánto tiempo necesito para ver resultados?',
                  a: 'Depende de tu dedicación y aplicación. Algunos estudiantes han obtenido sus primeros resultados en semanas, otros en meses. La diferencia está en la consistencia y aplicación práctica.'
                },
                {
                  q: '¿El contenido se actualiza?',
                  a: 'Sí, actualizamos el contenido diariamente a las 8 a.m. para reflejar las últimas herramientas, tendencias y mejores prácticas del marketing digital.'
                },
                {
                  q: '¿Puedo cancelar en cualquier momento?',
                  a: 'Con el plan mensual, sí. Puedes cancelar cuando lo desees sin penalizaciones. El Plan Completo es un pago único sin renovaciones ni cargos recurrentes.'
                },
                {
                  q: '¿Hay garantía de devolución?',
                  a: 'Ofrecemos 30 días de garantía. Si decides que DigiCash Academy no es para ti dentro de los primeros 30 días, te devolvemos el 100% de tu inversión.'
                }
              ].map((faq, i) => (
                <div 
                  key={i}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-950 via-black to-gray-950 shadow-lg transition-all duration-500 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-8 text-left transition-all"
                  >
                    <span className="text-xl font-semibold">{faq.q}</span>
                    <ChevronDown 
                      className={`h-6 w-6 flex-shrink-0 text-blue-400 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-white/5 px-8 pb-8 pt-6">
                      <p className="font-normal leading-relaxed text-gray-300">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-12 text-center">
            <h2 className="text-6xl font-bold leading-tight md:text-7xl">
              Comienza tu transformación digital hoy
            </h2>
            <p className="text-xl font-normal text-gray-300">
              Únete a estudiantes que están construyendo su futuro financiero con habilidades digitales prácticas.
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-center">
              <Link href="/inscribete">
                <Button size="lg" className="h-16 w-full bg-gradient-to-r from-red-600 to-red-700 px-14 text-lg font-semibold shadow-2xl shadow-red-600/50 transition-all hover:scale-105 hover:shadow-red-600/70 sm:w-auto">
                  Inscríbete ahora
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-16 w-full border-2 border-white/20 bg-transparent px-14 text-lg font-semibold backdrop-blur-sm transition-all hover:scale-105 hover:border-white/40 hover:bg-white/5 sm:w-auto">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-[200px]" />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
                  alt="DigiCash Academy" 
                  className="h-12 object-contain"
                  style={{ width: 'auto' }}
                />
                <span className="text-xl font-medium">DigiCash Academy</span>
              </div>
              <p className="font-normal leading-relaxed text-gray-400">
                Desarrolla habilidades digitales que generan ingresos reales.
              </p>
            </div>

            <div className="space-y-5">
              <h4 className="text-lg font-semibold">Plataforma</h4>
              <ul className="space-y-4 font-medium text-gray-400">
                <li><a href="#inicio" className="transition-colors hover:text-blue-400">Inicio</a></li>
                <li><a href="#profesiones" className="transition-colors hover:text-blue-400">Campus</a></li>
                <li><a href="#reseñas" className="transition-colors hover:text-blue-400">Resultados</a></li>
                <li><a href="#información" className="transition-colors hover:text-blue-400">Información</a></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-lg font-semibold">Acceso</h4>
              <ul className="space-y-4 font-medium text-gray-400">
                <li><Link href="/login" className="transition-colors hover:text-blue-400">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="transition-colors hover:text-blue-400">Registrarse</Link></li>
                <li><Link href="/inscribete" className="transition-colors hover:text-blue-400">Planes</Link></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="space-y-4 font-medium text-gray-400">
                <li><a href="#" className="transition-colors hover:text-blue-400">Términos de Servicio</a></li>
                <li><a href="#" className="transition-colors hover:text-blue-400">Política de Privacidad</a></li>
                <li><a href="#" className="transition-colors hover:text-blue-400">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-white/5 pt-10 text-center">
            <p className="font-medium text-gray-500">© 2024 DigiCash Academy. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
