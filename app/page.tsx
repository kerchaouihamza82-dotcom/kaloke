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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-10 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-xl font-light tracking-wide">DigiCash Academy</span>
          </div>
          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#inicio" className="text-sm font-light transition-colors hover:text-blue-500">Inicio</a>
            <a href="#profesiones" className="text-sm font-light transition-colors hover:text-blue-500">Profesiones</a>
            <a href="#reseñas" className="text-sm font-light transition-colors hover:text-blue-500">Reseñas</a>
            <a href="#información" className="text-sm font-light transition-colors hover:text-blue-500">Información</a>
            <Link href="/login" className="text-sm font-light transition-colors hover:text-blue-500">Acceso</Link>
            <Link href="/inscribete">
              <Button className="bg-red-600 font-medium hover:bg-red-700">Inscríbete Ahora</Button>
            </Link>
          </nav>
          <div className="lg:hidden">
            <Link href="/inscribete">
              <Button className="bg-red-600 hover:bg-red-700">Inscríbete</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden pt-32">
        <div className="container mx-auto px-6 py-24 md:py-40">
          <div className="mx-auto max-w-5xl space-y-12 text-center">
            <div className="space-y-6">
              <h1 className="text-6xl font-light tracking-tight md:text-7xl lg:text-8xl">
                Aprende a generar ingresos online
              </h1>
              <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-gray-400 md:text-2xl">
                La educación tradicional avanza demasiado lento. Cuatro años es demasiado tiempo cuando puedes aprender habilidades rentables hoy y aplicarlas mañana.
              </p>
            </div>

            {/* Video VSL */}
            <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl shadow-2xl shadow-blue-500/10">
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
              <Button size="lg" className="h-14 bg-red-600 px-12 text-base font-medium hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30">
                Empieza hoy
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-8 pt-12 md:grid-cols-4">
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">25</div>
                <div className="text-sm font-light text-gray-500">Estudiantes Inscritos</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">17</div>
                <div className="text-sm font-light text-gray-500">Historias de Éxito</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">5</div>
                <div className="text-sm font-light text-gray-500">Métodos de Creación de Riqueza</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-blue-500">25</div>
                <div className="text-sm font-light text-gray-500">Estudiantes Activos</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[200px]" />
      </section>

      {/* Mensaje de Conciencia */}
      <section className="border-y border-white/5 py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-4xl font-light leading-tight md:text-5xl">
              El mundo digital avanza más rápido que la educación tradicional
            </h2>
            <p className="text-lg font-light leading-relaxed text-gray-400">
              Actualizamos el contenido cada día a las 8 a.m. para mantener a los estudiantes al día con las últimas herramientas digitales, automatización e inteligencia artificial aplicadas a negocios online.
            </p>
            <p className="text-base font-light text-blue-400">
              Información práctica. Resultados reales. Sin teoría innecesaria.
            </p>
            <Link href="/inscribete">
              <Button size="lg" className="mt-4 bg-red-600 px-10 font-medium hover:bg-red-700">
                Empieza ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Accede a 5 Campus */}
      <section id="profesiones" className="py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mb-20 space-y-4 text-center">
            <h2 className="text-5xl font-light">Accede a 5 campus especializados</h2>
            <p className="text-lg font-light text-gray-500">Habilidades que puedes aplicar de inmediato</p>
          </div>
          
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <Card className="group border border-white/5 bg-gradient-to-br from-black to-gray-950 transition-all duration-300 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/10">
              <CardContent className="space-y-6 p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <Brain className="h-7 w-7 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-light">Agencia Automatizada con IA</h3>
                  <p className="font-light leading-relaxed text-gray-500">
                    Crea sistemas automatizados que puedes ofrecer a negocios online o usar para tu propio proyecto.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-white/5 bg-gradient-to-br from-black to-gray-950 transition-all duration-300 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/10">
              <CardContent className="space-y-6 p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <Users className="h-7 w-7 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-light">Campus de Instagram</h3>
                  <p className="font-light leading-relaxed text-gray-500">
                    Estrategias de venta online sin necesidad de mostrar tu rostro.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-white/5 bg-gradient-to-br from-black to-gray-950 transition-all duration-300 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/10">
              <CardContent className="space-y-6 p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <Zap className="h-7 w-7 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-light">Adquisición de Clientes Automatizada</h3>
                  <p className="font-light leading-relaxed text-gray-500">
                    Sistemas eficientes para conseguir y mantener clientes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-white/5 bg-gradient-to-br from-black to-gray-950 transition-all duration-300 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/10">
              <CardContent className="space-y-6 p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <Globe className="h-7 w-7 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-light">Bolsa de Trabajo Experta</h3>
                  <p className="font-light leading-relaxed text-gray-500">
                    Acceso a comunidad, mentorías y oportunidades de colaboración.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-white/5 bg-gradient-to-br from-black to-gray-950 transition-all duration-300 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/10 md:col-span-2">
              <CardContent className="space-y-6 p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <DollarSign className="h-7 w-7 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-light">Campus adicional</h3>
                  <p className="font-light leading-relaxed text-gray-500">
                    Acceso a contenido especializado y recursos exclusivos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plataforma Personalizada */}
      <section className="border-y border-white/5 py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-4xl font-light leading-tight md:text-5xl">
              Una plataforma diseñada para tu progreso
            </h2>
            <p className="text-lg font-light leading-relaxed text-gray-400">
              Nuestra plataforma está diseñada para facilitar el aprendizaje práctico, el seguimiento del progreso y la aplicación inmediata de lo aprendido.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios en Video */}
      <section className="py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mb-20 space-y-6 text-center">
            <h2 className="text-4xl font-light md:text-5xl">
              Logros dentro de DigiCash Academy
            </h2>
            <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-gray-400">
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
      <section id="reseñas" className="py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mb-20 space-y-6 text-center">
            <h2 className="text-4xl font-light md:text-5xl">
              Resultados verificables
            </h2>
            <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-gray-400">
              Métricas reales de cuentas gestionadas por estudiantes que aplicaron lo aprendido en DigiCash Academy.
            </p>
          </div>

          {/* Resultados Reales - Carrusel de Imágenes */}
          <div className="mb-16">
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

          <div className="space-y-8 text-center">
            <p className="text-lg font-light text-gray-400">
              Datos extraídos directamente de Instagram Analytics. Estas son métricas reales de cuentas manejadas por estudiantes.
            </p>
            <Link href="/inscribete">
              <Button size="lg" className="bg-red-600 px-10 font-medium hover:bg-red-700">
                Acceder ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Habilidad Digital */}
      <section id="información" className="border-y border-white/5 py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-16 text-center text-4xl font-light leading-tight md:text-5xl">
              Generar ingresos online es una habilidad que se aprende
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border border-white/5 bg-black">
                <CardContent className="space-y-6 p-10 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                      <CheckCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-light">Plataforma de aprendizaje personalizada</h3>
                </CardContent>
              </Card>

              <Card className="border border-white/5 bg-black">
                <CardContent className="space-y-6 p-10 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-light">Escala desde 0 hasta $1,000/mes en el menor tiempo posible</h3>
                </CardContent>
              </Card>

              <Card className="border border-white/5 bg-black">
                <CardContent className="space-y-6 p-10 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-light">Cursos avanzados para aumentar ingresos</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Red Privada */}
      <section className="py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-12 text-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-light md:text-5xl">
                Red Privada Global
              </h2>
              <p className="text-lg font-light text-gray-400">
                Colabora, comparte resultados y conecta con otros estudiantes enfocados en crecimiento.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-white/5 bg-gray-950 p-8">
                <MessageSquare className="mx-auto h-10 w-10 text-blue-500" />
                <h3 className="text-lg font-light">Comunidad privada</h3>
                <p className="font-light text-gray-500">Conexión con más de 100 estudiantes activos</p>
              </div>
              <div className="space-y-4 rounded-3xl border border-white/5 bg-gray-950 p-8">
                <Zap className="mx-auto h-10 w-10 text-blue-500" />
                <h3 className="text-lg font-light">Estrategias aplicables</h3>
                <p className="font-light text-gray-500">Aprende técnicas probadas</p>
              </div>
              <div className="space-y-4 rounded-3xl border border-white/5 bg-gray-950 p-8">
                <Users className="mx-auto h-10 w-10 text-blue-500" />
                <h3 className="text-lg font-light">Networking</h3>
                <p className="font-light text-gray-500">Construye relaciones valiosas</p>
              </div>
              <div className="space-y-4 rounded-3xl border border-white/5 bg-gray-950 p-8">
                <Globe className="mx-auto h-10 w-10 text-blue-500" />
                <h3 className="text-lg font-light">Conexión global</h3>
                <p className="font-light text-gray-500">Colabora internacionalmente</p>
              </div>
            </div>

            <Link href="/inscribete">
              <Button size="lg" className="bg-red-600 px-10 font-medium hover:bg-red-700">
                Únete hoy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-white/5 py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mb-20 space-y-4 text-center">
            <h2 className="text-4xl font-light md:text-5xl">
              Elige tu plan
            </h2>
            <p className="text-lg font-light text-gray-500">Dos opciones para comenzar</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Plan Único */}
            <Card className="border border-white/5 bg-gray-950">
              <CardContent className="space-y-8 p-10">
                <div className="space-y-4 text-center">
                  <h3 className="text-xl font-light text-gray-400">INVERSIÓN ÚNICA</h3>
                  <div className="text-6xl font-light">$2,500</div>
                  <p className="font-light text-gray-500">
                    Acceso completo de por vida
                  </p>
                </div>
                <Link href="/inscribete" className="block">
                  <Button className="w-full bg-white font-medium text-black hover:bg-gray-200">
                    Acceder ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plan Mensual - Destacado */}
            <Card className="relative border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-gray-950">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 px-6 py-2 text-sm font-medium text-white">
                  RECOMENDADO
                </Badge>
              </div>
              <CardContent className="space-y-8 p-10 pt-12">
                <div className="space-y-4 text-center">
                  <h3 className="text-xl font-light text-blue-400">SUSCRIPCIÓN MENSUAL</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-light text-blue-500">$9.99</span>
                    <span className="text-xl font-light text-gray-500">/ mes</span>
                  </div>
                  <p className="font-light text-gray-400">
                    Acceso inmediato y actualizaciones continuas
                  </p>
                </div>
                <Link href="/inscribete" className="block">
                  <Button className="w-full bg-red-600 text-base font-medium hover:bg-red-700">
                    Acceder ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-white/5 py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-16 text-center text-4xl font-light md:text-5xl">
              Preguntas Frecuentes
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "¿Qué incluye la suscripción?",
                  a: "Acceso a los 5 campus especializados, actualizaciones diarias de contenido, comunidad privada y recursos descargables."
                },
                {
                  q: "¿Puedo cancelar en cualquier momento?",
                  a: "Sí, puedes cancelar tu suscripción cuando lo desees sin compromiso."
                },
                {
                  q: "¿Necesito experiencia previa?",
                  a: "No. El contenido está diseñado para que cualquier persona pueda empezar desde cero."
                },
                {
                  q: "¿Cuánto tiempo necesito dedicar?",
                  a: "Depende de ti. Algunos estudiantes dedican 1-2 horas al día, otros más. La plataforma se adapta a tu ritmo."
                },
                {
                  q: "¿Hay garantía de devolución?",
                  a: "Ofrecemos 7 días de garantía. Si no estás satisfecho, te devolvemos el dinero."
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-white/5">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-blue-500"
                  >
                    <span className="text-lg font-light">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="pb-6 font-light leading-relaxed text-gray-400">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 md:py-40">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl space-y-12 text-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-light leading-tight md:text-5xl">
                Empieza a construir tu futuro hoy
              </h2>
              <p className="text-lg font-light text-gray-400">
                No esperes cuatro años. Aprende habilidades digitales rentables y aplícalas de inmediato.
              </p>
            </div>
            
            <Link href="/inscribete">
              <Button size="lg" className="h-14 bg-red-600 px-12 text-base font-medium hover:bg-red-700">
                Inscríbete ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
