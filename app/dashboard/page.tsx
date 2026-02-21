'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, MessageSquare, Video, Clock, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    coursesAvailable: 0,
    coursesInProgress: 0,
    totalHours: 0,
    lessonsCompleted: 0,
    totalLessons: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })

      // Get user enrollments
      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get completed lessons count
      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true)

      // Get total lessons count
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })

      // Calculate total hours watched
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('last_position_seconds')
        .eq('user_id', user.id)

      const totalSeconds = progress?.reduce((acc, p) => acc + (p.last_position_seconds || 0), 0) || 0
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10

      console.log('[v0] Dashboard stats loaded:', {
        coursesCount,
        enrollmentsCount,
        completedLessons,
        totalLessons,
        totalHours
      })

      setStats({
        coursesAvailable: coursesCount || 0,
        coursesInProgress: enrollmentsCount || 0,
        totalHours,
        lessonsCompleted: completedLessons || 0,
        totalLessons: totalLessons || 0
      })
    } catch (error) {
      console.error('[v0] Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Section with Logo */}
      <div className="flex items-center gap-6">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
          alt="DigiCash Academy" 
          className="h-20 rounded-xl object-contain"
          style={{ width: 'auto' }}
        />
        <div className="space-y-2">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            Bienvenido a tu Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Tu plataforma exclusiva para viralizar tu marca personal
          </p>
        </div>
      </div>

      {/* Stats Cards - Real Data from Database */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cursos Disponibles</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.coursesAvailable}</div>
              <p className="text-xs text-muted-foreground">Cursos totales en la plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cursos en Progreso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.coursesInProgress}</div>
              <p className="text-xs text-muted-foreground">Cursos que estás tomando</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Horas Vistas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalHours}h</div>
              <p className="text-xs text-muted-foreground">Tiempo total de video visto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lecciones Completadas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.lessonsCompleted} / {stats.totalLessons}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalLessons > 0 
                  ? `${Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)}% completado`
                  : 'Sin lecciones aún'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Acceso Rápido</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                <CardTitle>Cursos</CardTitle>
              </div>
              <CardDescription className="text-foreground">
                Accede a cursos de marca personal, mentalidad y sublimación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/courses">
                <Button variant="default" className="w-full gap-2">
                  Ver Cursos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Comunidad</CardTitle>
              </div>
              <CardDescription className="text-foreground">
                Conecta con otros creadores y emprendedores exitosos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/community">
                <Button variant="default" className="w-full gap-2">
                  Ir a Comunidad
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Video className="h-5 w-5" />
                <CardTitle>Llamadas en Vivo</CardTitle>
              </div>
              <CardDescription className="text-foreground">
                Participa en sesiones con expertos en marketing digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/calls">
                <Button variant="default" className="w-full gap-2">
                  Ver Llamadas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
