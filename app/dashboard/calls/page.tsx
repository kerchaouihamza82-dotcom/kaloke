'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Users, Plus, Edit, Trash2 } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"

export default function CallsPage() {
  const { isAdmin } = useAdmin()

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Llamadas en Vivo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Participa en sesiones en vivo, mentorías y webinars exclusivos
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Programar Llamada
          </Button>
        )}
      </div>

      {/* Próximas llamadas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Próximas sesiones</h2>
        
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <Badge className="bg-primary text-primary-foreground">Hoy</Badge>
                <Badge variant="outline">Mentoría 1-on-1</Badge>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle>Sesión de Mentoría Personal</CardTitle>
              <CardDescription className="mt-2">
                Reunión individual para resolver dudas y revisar tu estrategia de trading
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Hoy, 15 de Febrero</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>3:00 PM - 4:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>1 participante</span>
              </div>
            </div>
            <Button className="w-full">
              <Video className="mr-2 h-4 w-4" />
              Unirse a la llamada
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="secondary">Mañana</Badge>
              <Badge variant="outline">Webinar</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle>Estrategias de Trading para 2024</CardTitle>
              <CardDescription className="mt-2">
                Webinar grupal sobre las mejores estrategias y tendencias del mercado para este año
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Viernes, 16 de Febrero</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>6:00 PM - 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>45 registrados</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Recordarme
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="secondary">Próximamente</Badge>
              <Badge variant="outline">Taller</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle>Workshop: Análisis Técnico Avanzado</CardTitle>
              <CardDescription className="mt-2">
                Taller práctico donde aprenderás a usar herramientas profesionales de análisis
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Lunes, 19 de Febrero</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>4:00 PM - 6:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>20 cupos disponibles</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Registrarse
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Grabaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Grabaciones disponibles</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">Grabación</Badge>
              <CardTitle className="mt-4">Introducción a DeFi</CardTitle>
              <CardDescription>Webinar del 10 de Febrero</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Ver grabación
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">Grabación</Badge>
              <CardTitle className="mt-4">Gestión de Riesgo</CardTitle>
              <CardDescription>Taller del 5 de Febrero</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Ver grabación
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">Grabación</Badge>
              <CardTitle className="mt-4">Trading Psicológico</CardTitle>
              <CardDescription>Webinar del 1 de Febrero</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Ver grabación
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
