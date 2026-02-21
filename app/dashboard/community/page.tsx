'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Users, Plus, Edit, Trash2, Shield } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import { CommunityChat } from "@/components/community-chat"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function CommunityPage() {
  const { isAdmin } = useAdmin()
  const [userName, setUserName] = useState('Usuario')
  const supabase = createClient()

  useEffect(() => {
    const getUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const displayName = user.user_metadata?.display_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'Usuario'
        setUserName(displayName)
      }
    }
    getUserName()
  }, [])

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Comunidad
          </h1>
          <p className="mt-2 text-muted-foreground">
            Conecta con otros estudiantes y comparte conocimientos
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear publicación
          </Button>
          {isAdmin && (
            <Button variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Moderar
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+12 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discusiones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+89 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tus publicaciones</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+3 esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat en Tiempo Real */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Chat Comunitario</h2>
        <div className="h-[600px]">
          <CommunityChat currentUserName={userName} />
        </div>
      </div>

      {/* Publicaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Publicaciones recientes</h2>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">Juan Díaz</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <Badge>Trading</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle className="mb-2">¿Cuál es la mejor estrategia para principiantes?</CardTitle>
              <CardDescription>
                Estoy comenzando en el mundo del trading y me gustaría saber qué estrategias recomiendan 
                para alguien que está empezando. ¿DCA? ¿Swing trading?
              </CardDescription>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>24</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>12 respuestas</span>
                </Button>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>MP</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">María Pérez</p>
                  <p className="text-xs text-muted-foreground">Hace 5 horas</p>
                </div>
              </div>
              <Badge>DeFi</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle className="mb-2">Guía completa sobre staking en 2024</CardTitle>
              <CardDescription>
                He preparado una guía detallada sobre cómo hacer staking de manera segura. 
                Incluye comparación de plataformas, rendimientos y consejos de seguridad.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>45</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>28 respuestas</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>CR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">Carlos Rodríguez</p>
                  <p className="text-xs text-muted-foreground">Hace 1 día</p>
                </div>
              </div>
              <Badge>Bitcoin</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle className="mb-2">Análisis del mercado - Enero 2024</CardTitle>
              <CardDescription>
                Comparto mi análisis técnico del comportamiento de Bitcoin este mes. 
                Niveles clave, resistencias y posibles escenarios para febrero.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>67</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>34 respuestas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
