'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User, Tag } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Curso {
  id: string
  titulo: string
  descripcion: string
  instructor: string
  categoria: string
  fecha_creacion: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('fecha_creacion', { ascending: false })
      
      if (error) {
        console.error('[v0] Error loading courses:', error)
        return
      }
      
      setCourses(data || [])
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Cursos Disponibles
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explora nuestro catálogo de cursos y comienza a aprender
          </p>
        </div>
      </div>

      {/* Grid de Cursos */}
      {courses.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            No hay cursos disponibles
          </p>
          <p className="text-sm text-muted-foreground">
            Los cursos aparecerán aquí cuando estén disponibles
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <Card className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className="bg-primary/10 text-primary">
                      {course.categoria}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">{course.titulo}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                  </div>
                  <Button className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Ver Curso
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
