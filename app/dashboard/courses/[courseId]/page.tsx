'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ArrowLeft, PlayCircle, ExternalLink, User, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Curso {
  id: string
  titulo: string
  descripcion: string
  instructor: string
  categoria: string
}

interface Modulo {
  id: string
  titulo: string
  orden_index: number
  sesiones: Sesion[]
}

interface Sesion {
  id: string
  titulo: string
  video_url: string
  orden_index: number
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  
  const [course, setCourse] = useState<Curso | null>(null)
  const [modules, setModules] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      const supabase = createClient()
      
      // Cargar información del curso
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', courseId)
        .single()

      if (cursoError) throw cursoError
      setCourse(cursoData)

      // Cargar módulos con sus sesiones
      const { data: modulosData, error: modulosError } = await supabase
        .from('modulos')
        .select(`
          id,
          titulo,
          orden_index,
          sesiones (
            id,
            titulo,
            video_url,
            orden_index
          )
        `)
        .eq('curso_id', courseId)
        .order('orden_index', { ascending: true })

      if (modulosError) throw modulosError

      // Ordenar sesiones dentro de cada módulo
      const formattedModulos = modulosData?.map(modulo => ({
        ...modulo,
        sesiones: (modulo.sesiones as Sesion[]).sort((a, b) => a.orden_index - b.orden_index)
      })) || []

      setModules(formattedModulos)
    } catch (error) {
      console.error('[v0] Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalSesiones = () => {
    return modules.reduce((total, modulo) => total + modulo.sesiones.length, 0)
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Curso no encontrado</p>
          <Link href="/dashboard/courses">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a cursos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/courses">
          <Button variant="outline" size="sm" className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary">{course.categoria}</Badge>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight">
            {course.titulo}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {course.descripcion}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Instructor: {course.instructor}</span>
            </div>
            <div className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              <span>{getTotalSesiones()} sesiones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del curso */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido del Curso</CardTitle>
          <CardDescription>
            {modules.length} módulos • {getTotalSesiones()} sesiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <PlayCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium text-muted-foreground">
                Este curso aún no tiene contenido
              </p>
              <p className="text-sm text-muted-foreground">
                Los módulos y sesiones aparecerán aquí cuando estén disponibles
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {modules.map((modulo, moduloIndex) => (
                <AccordionItem key={modulo.id} value={modulo.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {moduloIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{modulo.titulo}</h3>
                        <p className="text-xs text-muted-foreground">
                          {modulo.sesiones.length} {modulo.sesiones.length === 1 ? 'sesión' : 'sesiones'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {modulo.sesiones.length === 0 ? (
                      <p className="py-4 pl-11 text-sm text-muted-foreground">
                        No hay sesiones disponibles en este módulo
                      </p>
                    ) : (
                      <div className="space-y-2 pl-11 pr-4">
                        {modulo.sesiones.map((sesion, sesionIndex) => (
                          <a
                            key={sesion.id}
                            href={sesion.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                              <div>
                                <p className="font-medium group-hover:text-primary">
                                  {sesionIndex + 1}. {sesion.titulo}
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </a>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
