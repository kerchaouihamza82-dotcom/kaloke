import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, TrendingUp, Shield } from "lucide-react"
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
          <Link href="/login">
            <Button variant="outline" className="gap-2 bg-transparent">
              Iniciar Sesión
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex min-h-screen flex-col items-center justify-center py-24 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
            Plataforma Exclusiva de Aprendizaje
          </div>
          
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            Viraliza tu Marca Personal
          </h1>
          
          <p className="mx-auto mb-12 max-w-2xl text-balance text-xl text-muted-foreground">
            Aprende a crear contenido viral, desarrolla tu mentalidad de éxito y domina la sublimación profesional
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Comenzar Ahora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Todo lo que necesitas para aprender
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Cursos Especializados</h3>
              <p className="text-muted-foreground">
                Marca personal, mentalidad y sublimación profesional al más alto nivel
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Comunidad Exclusiva</h3>
              <p className="text-muted-foreground">
                Conecta con creadores de contenido y emprendedores exitosos
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Mentoría en Vivo</h3>
              <p className="text-muted-foreground">
                Sesiones exclusivas con expertos en marketing digital y desarrollo personal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-primary">500+</p>
              <p className="text-muted-foreground">Estudiantes Activos</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-primary">50+</p>
              <p className="text-muted-foreground">Cursos Disponibles</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-primary">98%</p>
              <p className="text-muted-foreground">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Shield className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Comienza tu transformación hoy
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Únete a nuestra comunidad de creadores exitosos y transforma tu presencia digital
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Registrarse Ahora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
                alt="DigiCash Academy" 
                className="h-10 w-10 object-contain"
              />
              <span className="font-semibold text-foreground">DigiCash Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 DigiCash Academy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
