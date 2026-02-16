'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ArrowLeft, PlayCircle, ExternalLink, User, Plus, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/hooks/use-admin'
import { toast } from 'sonner'

interface Curso {
  id: string
  titulo: string
  descripcion: string
  instructor: string
  categoria: string
  imagen_url?: string
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
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [sesionDialogOpen, setSesionDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Modulo | null>(null)
  const [editingSesion, setEditingSesion] = useState<{ sesion: Sesion | null, moduleId: string | null }>({ sesion: null, moduleId: null })
  const { isAdmin } = useAdmin()

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

  // CRUD Módulos
  const handleSubmitModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const moduleData = {
      curso_id: courseId,
      titulo: formData.get('titulo') as string,
      orden_index: editingModule?.orden_index || modules.length + 1
    }

    try {
      const supabase = createClient()

      if (editingModule) {
        const { error } = await supabase
          .from('modulos')
          .update(moduleData)
          .eq('id', editingModule.id)

        if (error) throw error
        toast.success('Módulo actualizado')
      } else {
        const { error } = await supabase
          .from('modulos')
          .insert([moduleData])

        if (error) throw error
        toast.success('Módulo creado')
      }

      setModuleDialogOpen(false)
      setEditingModule(null)
      loadCourseData()
    } catch (error) {
      console.error('[v0] Error saving module:', error)
      toast.error('Error al guardar módulo')
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('¿Eliminar este módulo y todas sus sesiones?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('modulos')
        .delete()
        .eq('id', moduleId)

      if (error) throw error
      toast.success('Módulo eliminado')
      loadCourseData()
    } catch (error) {
      console.error('[v0] Error deleting module:', error)
      toast.error('Error al eliminar módulo')
    }
  }

  // CRUD Sesiones
  const handleSubmitSesion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const moduleId = editingSesion.moduleId
    if (!moduleId) return

    const module = modules.find(m => m.id === moduleId)
    const sesionData = {
      modulos_id: moduleId,
      titulo: formData.get('titulo') as string,
      video_url: formData.get('video_url') as string,
      orden_index: editingSesion.sesion?.orden_index || (module?.sesiones.length || 0) + 1
    }

    try {
      const supabase = createClient()

      if (editingSesion.sesion) {
        const { error } = await supabase
          .from('sesiones')
          .update(sesionData)
          .eq('id', editingSesion.sesion.id)

        if (error) throw error
        toast.success('Sesión actualizada')
      } else {
        const { error } = await supabase
          .from('sesiones')
          .insert([sesionData])

        if (error) throw error
        toast.success('Sesión creada')
      }

      setSesionDialogOpen(false)
      setEditingSesion({ sesion: null, moduleId: null })
      loadCourseData()
    } catch (error) {
      console.error('[v0] Error saving sesion:', error)
      toast.error('Error al guardar sesión')
    }
  }

  const handleDeleteSesion = async (e: React.MouseEvent, sesionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('¿Eliminar esta sesión?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sesiones')
        .delete()
        .eq('id', sesionId)

      if (error) throw error
      toast.success('Sesión eliminada')
      loadCourseData()
    } catch (error) {
      console.error('[v0] Error deleting sesion:', error)
      toast.error('Error al eliminar sesión')
    }
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
      {/* Back Button */}
      <div>
        <Link href="/dashboard/courses">
          <Button variant="outline" size="sm" className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Course Header with Image */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image */}
        {course.imagen_url && (
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-xl border shadow-lg">
              <img
                src={course.imagen_url}
                alt={course.titulo}
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Course Info */}
        <div className={course.imagen_url ? "lg:col-span-2" : "lg:col-span-3"}>
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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Contenido del Curso</CardTitle>
              <CardDescription>
                {modules.length} módulos • {getTotalSesiones()} sesiones
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingModule(null)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Módulo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}</DialogTitle>
                    <DialogDescription>
                      Añade un nuevo módulo al curso
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitModule} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título del Módulo</Label>
                      <Input
                        id="titulo"
                        name="titulo"
                        defaultValue={editingModule?.titulo}
                        placeholder="Ej: Introducción al Trading"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setModuleDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingModule ? 'Actualizar' : 'Crear'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
                    <div className="flex w-full items-center justify-between pr-4">
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
                      {isAdmin && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingModule(modulo)
                              setModuleDialogOpen(true)
                            }}
                            className="h-7 w-7 bg-transparent p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(modulo.id)}
                            className="h-7 w-7 bg-transparent p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-11 pr-4">
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSesion({ sesion: null, moduleId: modulo.id })
                            setSesionDialogOpen(true)
                          }}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir Sesión
                        </Button>
                      )}
                      {modulo.sesiones.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">
                          No hay sesiones disponibles en este módulo
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {modulo.sesiones.map((sesion, sesionIndex) => (
                            <div
                              key={sesion.id}
                              className="group flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5"
                            >
                              <a
                                href={sesion.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center gap-3"
                              >
                                <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                <div className="flex-1">
                                  <p className="font-medium group-hover:text-primary">
                                    {sesionIndex + 1}. {sesion.titulo}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              </a>
                              {isAdmin && (
                                <div className="ml-2 flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingSesion({ sesion, moduleId: modulo.id })
                                      setSesionDialogOpen(true)
                                    }}
                                    className="h-7 w-7 bg-transparent p-0"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleDeleteSesion(e, sesion.id)}
                                    className="h-7 w-7 bg-transparent p-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Sesiones */}
      {isAdmin && (
        <Dialog open={sesionDialogOpen} onOpenChange={setSesionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSesion.sesion ? 'Editar Sesión' : 'Crear Nueva Sesión'}</DialogTitle>
              <DialogDescription>
                Completa la información de la sesión y añade el enlace del video
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitSesion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título de la Sesión</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  defaultValue={editingSesion.sesion?.titulo}
                  placeholder="Ej: Introducción a Bitcoin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">URL del Video</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  defaultValue={editingSesion.sesion?.video_url}
                  placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  El video se abrirá en una nueva pestaña cuando los usuarios hagan clic
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSesionDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSesion.sesion ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
