import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Users, TrendingUp, Shield, Trophy, Clock, CheckCircle, Star, Video, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-12 w-12 object-contain"
            />
            <span className="text-xl font-bold text-foreground">DigiCash Academy</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#beneficios" className="text-sm font-medium transition-colors hover:text-primary">
              Beneficios
            </Link>
            <Link href="#como-funciona" className="text-sm font-medium transition-colors hover:text-primary">
              Cómo Funciona
            </Link>
            <Link href="#testimonios" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonios
            </Link>
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Comenzar</Button>
            </Link>
          </nav>
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-transparent">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32">
        <div className="container py-20 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-8">
              <Badge className="w-fit" variant="secondary">
                <Zap className="mr-1 h-3 w-3" />
                Acceso Ilimitado • +500 Cursos
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                  Aprende desde dónde quieras con cursos online
                </h1>
                <p className="text-pretty text-lg text-muted-foreground md:text-xl">
                  Domina nuevas habilidades con expertos de la industria. Accede a cientos de cursos diseñados para transformar tu carrera profesional.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/register" className="flex-1 sm:flex-initial">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="flex-1 sm:flex-initial">
                  <Button size="lg" variant="outline" className="w-full bg-transparent sm:w-auto">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-6">
                <div>
                  <div className="text-4xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Cursos</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">50K+</div>
                  <div className="text-sm text-muted-foreground">Estudiantes</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">20+</div>
                  <div className="text-sm text-muted-foreground">Categorías</div>
                </div>
              </div>
            </div>

            {/* Right Content - Mockup */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent blur-2xl" />
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xHn5V1DNK7XqFiZXre7SKxlw07kEQe.png"
                  alt="Platform Preview"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="border-y bg-muted/30 py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <Badge className="mb-4" variant="outline">Beneficios</Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                ¿Por qué elegirnos?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Todo lo que necesitas para impulsar tu carrera profesional
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="group border-2 transition-all hover:border-primary hover:shadow-xl">
                <CardContent className="pt-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Acceso a Todos los Cursos</h3>
                  <p className="text-muted-foreground">
                    Más de 500 cursos disponibles en múltiples categorías. Aprende todo lo que necesites sin límites.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-2 transition-all hover:border-primary hover:shadow-xl">
                <CardContent className="pt-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary/20">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Certificaciones Completas</h3>
                  <p className="text-muted-foreground">
                    Obtén certificados verificados al completar cada curso. Destaca en tu carrera profesional.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-2 transition-all hover:border-primary hover:shadow-xl">
                <CardContent className="pt-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary/20">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Aprende a Tu Ritmo</h3>
                  <p className="text-muted-foreground">
                    Estudia cuando quieras, donde quieras. Acceso 24/7 desde cualquier dispositivo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <Badge className="mb-4" variant="outline">Proceso Simple</Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                Cómo Funciona
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Comienza tu viaje de aprendizaje en 3 simples pasos
              </p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-3">
              <div className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                  1
                </div>
                <h3 className="mb-3 text-2xl font-bold">Elige Tu Curso</h3>
                <p className="text-muted-foreground">
                  Explora nuestro catálogo y selecciona los cursos que se ajusten a tus objetivos profesionales.
                </p>
              </div>
              
              <div className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                  2
                </div>
                <h3 className="mb-3 text-2xl font-bold">Estudia Online</h3>
                <p className="text-muted-foreground">
                  Accede a contenido de alta calidad, videos, ejercicios y material descargable en cualquier momento.
                </p>
              </div>
              
              <div className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                  3
                </div>
                <h3 className="mb-3 text-2xl font-bold">Mejora Tu Futuro</h3>
                <p className="text-muted-foreground">
                  Aplica lo aprendido, obtén tu certificado y lleva tu carrera al siguiente nivel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-y bg-muted/30 py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <Badge className="mb-4" variant="outline">Precio Simple</Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                Acceso Ilimitado
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Un solo plan. Todo incluido. Sin sorpresas.
              </p>
            </div>
            
            <Card className="mx-auto max-w-2xl border-2 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <Badge className="mb-6">Más Popular</Badge>
                  <div className="mb-2 text-6xl font-bold">$99</div>
                  <div className="mb-8 text-lg text-muted-foreground">por mes</div>
                  
                  <div className="mb-10 space-y-4">
                    <div className="flex items-start justify-center gap-3 text-left">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>Acceso ilimitado a +500 cursos premium</span>
                    </div>
                    <div className="flex items-start justify-center gap-3 text-left">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>Certificados verificados al completar</span>
                    </div>
                    <div className="flex items-start justify-center gap-3 text-left">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>Contenido nuevo agregado mensualmente</span>
                    </div>
                    <div className="flex items-start justify-center gap-3 text-left">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>Soporte prioritario 24/7</span>
                    </div>
                    <div className="flex items-start justify-center gap-3 text-left">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>Acceso desde cualquier dispositivo</span>
                    </div>
                  </div>
                  
                  <Link href="/register">
                    <Button size="lg" className="w-full md:w-auto md:min-w-[300px]">
                      Comenzar Ahora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <Badge className="mb-4" variant="outline">Testimonios</Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                Lo Que Dicen Nuestros Estudiantes
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Miles de estudiantes ya están transformando sus carreras
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-2">
                <CardContent className="pt-8">
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">
                    "Los cursos son increíbles y muy bien estructurados. He aprendido más en 3 meses que en años de estudio tradicional."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">María González</div>
                      <div className="text-sm text-muted-foreground">Desarrolladora Web</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-8">
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">
                    "La flexibilidad de poder estudiar a mi ritmo es invaluable. Los instructores son expertos en sus campos."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Carlos Ruiz</div>
                      <div className="text-sm text-muted-foreground">Diseñador UX/UI</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-8">
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">
                    "Excelente inversión. He conseguido un mejor trabajo gracias a las habilidades que aprendí aquí."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Ana Martínez</div>
                      <div className="text-sm text-muted-foreground">Data Analyst</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-y bg-primary py-20 text-primary-foreground md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              Comienza Tu Transformación Hoy
            </h2>
            <p className="mb-10 text-lg opacity-90 md:text-xl">
              Únete a miles de estudiantes que ya están alcanzando sus metas profesionales
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto">
                  Ya Tengo Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
                  alt="DigiCash Academy" 
                  className="h-10 w-10 object-contain"
                />
                <span className="text-xl font-bold">DigiCash Academy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu plataforma de aprendizaje online para impulsar tu carrera profesional.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="mb-4 font-semibold">Plataforma</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="transition-colors hover:text-primary">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="transition-colors hover:text-primary">
                    Registrarse
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/courses" className="transition-colors hover:text-primary">
                    Ver Cursos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="mb-4 font-semibold">Empresa</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-primary">
                    Acerca de Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-primary">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-primary">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-primary">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-primary">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mx-auto mt-12 max-w-6xl border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 DigiCash Academy. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
