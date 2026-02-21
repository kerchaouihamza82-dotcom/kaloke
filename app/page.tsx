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
import { useState } from "react"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-12 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-2xl font-bold">DigiCash Academy</span>
          </div>
          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#inicio" className="text-sm font-medium transition-colors hover:text-blue-500">Inicio</a>
            <a href="#profesiones" className="text-sm font-medium transition-colors hover:text-blue-500">Profesiones</a>
            <a href="#reseñas" className="text-sm font-medium transition-colors hover:text-blue-500">Reseñas</a>
            <a href="#información" className="text-sm font-medium transition-colors hover:text-blue-500">Información</a>
            <a href="#blog" className="text-sm font-medium transition-colors hover:text-blue-500">Blog</a>
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-blue-500">Campus</Link>
            <Button className="bg-red-600 hover:bg-red-700">Inscríbete Ahora</Button>
          </nav>
          <div className="lg:hidden">
            <Button className="bg-red-600 hover:bg-red-700">Inscríbete</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden pt-32">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mb-6 text-6xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              GANA DINERO HOY
            </h1>
            <p className="mb-4 text-2xl text-gray-300 md:text-3xl">
              La educación moderna es demasiado lenta. Cuatro años es demasiado tiempo.
            </p>
            <p className="mb-12 text-xl text-blue-400">
              Aprende habilidades reales hoy que pueden ayudarte a generar ingresos mañana.
            </p>

            {/* Video VSL */}
            <div className="mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
              <video 
                controls 
                className="w-full"
                poster="/video-thumbnail.jpg"
              >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VSL_v2%20%281%29-JoZvEKb3RqhOkT2JMKF8zzumN1yLBj.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>

            <Button size="lg" className="mb-12 h-16 bg-red-600 px-12 text-lg font-bold hover:bg-red-700">
              INSCRÍBETE AHORA
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            {/* Métricas */}
            <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <div className="text-4xl font-bold text-blue-500">25</div>
                <div className="text-sm text-gray-400">Estudiantes Inscritos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500">17</div>
                <div className="text-sm text-gray-400">Historias de Éxito</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500">5</div>
                <div className="text-sm text-gray-400">Métodos de Creación de Riqueza</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500">25</div>
                <div className="text-sm text-gray-400">Estudiantes Activos</div>
              </div>
            </div>

            <p className="text-2xl font-bold text-red-600">
              TOMA ACCIÓN
            </p>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />
      </section>

      {/* Mensaje de Conciencia */}
      <section className="border-y border-white/10 bg-gradient-to-b from-black to-gray-900 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-4xl font-bold md:text-5xl">
              La educación tradicional ya no avanza al ritmo del mundo actual
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-gray-300">
              DigiCash Academy actualiza el contenido formativo cada día a las 8 a.m. para mantener a los estudiantes al día con herramientas digitales, automatización e inteligencia artificial aplicadas a negocios online.
            </p>
            <p className="mb-10 text-lg text-blue-400">
              Acceso rápido, información práctica y aprendizaje enfocado en resultados reales.
            </p>
            <Button size="lg" className="bg-red-600 px-10 hover:bg-red-700">
              Inscríbete Ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Accede a 5 Campus */}
      <section id="profesiones" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-bold">ACCEDE A 5 CAMPUS</h2>
            <p className="text-xl text-gray-400">Lo que aprenderás</p>
          </div>
          
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <Card className="group border-2 border-white/10 bg-gradient-to-br from-gray-900 to-black transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Agencia Automatizada con IA</h3>
                <p className="text-gray-400">
                  Aprende a crear sistemas automatizados que puedes ofrecer a negocios online o usar para tu propio proyecto.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-2 border-white/10 bg-gradient-to-br from-gray-900 to-black transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Campus de Instagram</h3>
                <p className="text-gray-400">
                  Aprende estrategias de venta online sin necesidad de mostrar tu rostro.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-2 border-white/10 bg-gradient-to-br from-gray-900 to-black transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Adquisición de Clientes Automatizada</h3>
                <p className="text-gray-400">
                  Sistemas y procesos para conseguir y mantener clientes de forma eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-2 border-white/10 bg-gradient-to-br from-gray-900 to-black transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Bolsa de Trabajo Experta</h3>
                <p className="text-gray-400">
                  Acceso a comunidad, mentorías y oportunidades de colaboración.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plataforma Personalizada */}
      <section className="border-y border-white/10 bg-gradient-to-b from-gray-900 to-black py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Una plataforma diseñada para tu progreso
            </h2>
            <p className="text-xl leading-relaxed text-gray-300">
              Nuestra plataforma educativa online está diseñada para facilitar el aprendizaje práctico, el seguimiento del progreso y la aplicación real de habilidades.
            </p>
          </div>
        </div>
      </section>

      {/* Prueba Social */}
      <section id="reseñas" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Resultados de estudiantes
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              En DigiCash Academy los estudiantes desarrollan habilidades digitales prácticas mientras forman parte de una comunidad enfocada en crecimiento profesional y aprendizaje continuo.
            </p>
          </div>

          {/* Testimonials - Placeholder para videos */}
          <div className="mx-auto mb-16 grid max-w-6xl gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 border-white/10 bg-gray-900">
                <CardContent className="p-6">
                  <div className="mb-4 aspect-video w-full rounded-lg bg-gray-800" />
                  <p className="text-gray-400">Video testimonio {i}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="mb-8 text-xl text-gray-300">
              Únete a una comunidad de más de 500,000 personas interesadas en mejorar sus habilidades digitales y sus ingresos.
            </p>
            <Button size="lg" className="bg-red-600 px-10 hover:bg-red-700">
              Inscríbete Ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Habilidad Digital */}
      <section id="información" className="border-y border-white/10 bg-gradient-to-b from-black to-gray-900 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-4xl font-bold md:text-5xl">
              El dinero online es una habilidad que se aprende
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-2 border-white/10 bg-black">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
                      <CheckCircle className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="mb-4 text-xl font-bold">Plataforma de aprendizaje personalizada</h3>
                </CardContent>
              </Card>

              <Card className="border-2 border-white/10 bg-black">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
                      <TrendingUp className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="mb-4 text-xl font-bold">Escala desde 0 hasta $1,000/mes lo antes posible</h3>
                </CardContent>
              </Card>

              <Card className="border-2 border-white/10 bg-black">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
                      <DollarSign className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="mb-4 text-xl font-bold">Cursos avanzados para aumentar ingresos</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Red Privada */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Red Privada Global
            </h2>
            <p className="mb-12 text-xl text-gray-300">
              Colabora, comparte resultados y conecta con otros estudiantes enfocados en crecimiento.
            </p>
            
            <div className="mb-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="mb-2 text-xl font-bold">Comunidad privada</h3>
                <p className="text-gray-400">Conexión con más de 100 estudiantes activos</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <Zap className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="mb-2 text-xl font-bold">Estrategias aplicables</h3>
                <p className="text-gray-400">Aprende técnicas probadas</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <Users className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="mb-2 text-xl font-bold">Networking</h3>
                <p className="text-gray-400">Construye relaciones valiosas</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <Globe className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="mb-2 text-xl font-bold">Conexión global</h3>
                <p className="text-gray-400">Colabora internacionalmente</p>
              </div>
            </div>

            <Button size="lg" className="bg-red-600 px-10 hover:bg-red-700">
              Inscríbete Hoy
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-white/10 bg-gradient-to-b from-gray-900 to-black py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Elige tu camino
            </h2>
            <p className="text-xl text-gray-400">Dos caminos se abren ante ti</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            {/* Plan Único */}
            <Card className="border-2 border-white/10 bg-gray-900">
              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold">INVERSIÓN ÚNICA</h3>
                  <div className="text-6xl font-bold text-white">$2,500</div>
                </div>
                <p className="mb-8 text-center text-gray-400">
                  Programa completo con acceso integral a la formación.
                </p>
                <Button className="w-full bg-white text-black hover:bg-gray-200">
                  Comprar Ahora
                </Button>
              </CardContent>
            </Card>

            {/* Plan Mensual - Destacado */}
            <Card className="relative border-4 border-yellow-500 bg-gradient-to-br from-yellow-900/30 to-gray-900">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-500 px-6 py-2 text-lg font-bold text-black">
                  RECOMENDADO
                </Badge>
              </div>
              <CardContent className="p-8 pt-10">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-yellow-500">SUSCRIPCIÓN</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold text-yellow-500">$9.99</span>
                    <span className="ml-2 text-2xl text-gray-400">/ mes</span>
                  </div>
                </div>
                <p className="mb-8 text-center text-gray-300">
                  Acceso inmediato a los contenidos y actualizaciones continuas.
                </p>
                <Button className="w-full bg-red-600 text-lg font-bold hover:bg-red-700">
                  Inscríbete Ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Logros */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Logros dentro de DigiCash Academy
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Muchos creen que solo un título tradicional garantiza oportunidades. Nuestros estudiantes demuestran que desarrollar habilidades prácticas también puede abrir puertas.
            </p>
          </div>

          {/* Galería de testimonios */}
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-white/10 bg-gray-900">
                <CardContent className="p-6">
                  <div className="mb-4 aspect-square w-full rounded-lg bg-gray-800" />
                  <p className="text-sm text-gray-400">Testimonio de éxito #{i}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-white/10 bg-gradient-to-b from-black to-gray-900 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-4xl font-bold md:text-5xl">
              Preguntas Frecuentes
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "¿Qué incluye la membresía?",
                  a: "Incluye acceso a todos los módulos activos, actualizaciones, comunidad privada y recursos descargables."
                },
                {
                  q: "¿Necesito experiencia previa?",
                  a: "No. Los programas están diseñados para principiantes y niveles intermedios."
                },
                {
                  q: "¿Cuánto tiempo toma ver resultados?",
                  a: "Depende del compromiso del estudiante y la aplicación práctica de lo aprendido."
                },
                {
                  q: "¿Puedo cancelar cuando quiera?",
                  a: "Sí. La suscripción mensual puede cancelarse en cualquier momento."
                },
                {
                  q: "¿Recibiré certificado?",
                  a: "Sí. Al completar los módulos se entrega certificado digital."
                },
                {
                  q: "¿Hay soporte?",
                  a: "Sí. El equipo y la comunidad están disponibles para resolver dudas."
                }
              ].map((faq, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-gray-900">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="text-lg font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="border-t border-white/10 p-6">
                      <p className="text-gray-400">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-5xl font-bold md:text-6xl">
              Esta puede ser tu oportunidad de empezar
            </h2>
            <Button size="lg" className="h-20 bg-red-600 px-16 text-2xl font-bold hover:bg-red-700">
              INSCRÍBETE AHORA
              <ArrowRight className="ml-3 h-8 w-8" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">
            <p>© 2024 DigiCash Academy. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
