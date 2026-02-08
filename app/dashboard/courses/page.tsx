'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) return
      setCourses(data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-500/10 text-green-600 dark:text-green-400',
      intermediate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      advanced: 'bg-red-500/10 text-red-600 dark:text-red-400'
    }
    const labels: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    }
    return { color: colors[level] || '', label: labels[level] || level }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
          Cursos Disponibles
        </h1>
        <p className="mt-2 text-muted-foreground">
          Marca personal, mentalidad de exito y sublimacion profesional
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            No hay cursos disponibles
          </p>
          <p className="text-sm text-muted-foreground">
            Los cursos apareceran aqui cuando esten disponibles
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const levelBadge = getLevelBadge(course.level)
            return (
              <Card key={course.id} className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <Badge className={levelBadge.color}>{levelBadge.label}</Badge>
                  <CardTitle className="mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_hours}h</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>{levelBadge.label}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button className="mt-4 w-full">Ver Curso</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
