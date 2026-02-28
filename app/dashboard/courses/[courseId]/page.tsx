'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ArrowLeft, PlayCircle, ExternalLink, User, Plus, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
  const [isAdmin, setIsAdmin] = useState(false)

  // Module dialog state
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Modulo | null>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [savingModule, setSavingModule] = useState(false)

  // Session dialog state
  const [sesionDialogOpen, setSesionDialogOpen] = useState(false)
  const [editingSesion, setEditingSesion] = useState<{ sesion: Sesion | null; moduleId: string | null }>({ sesion: null, moduleId: null })
  const [sesionTitle, setSesionTitle] = useState('')
  const [sesionUrl, setSesionUrl] = useState('')
  const [savingSesion, setSavingSesion] = useState(false)

  useEffect(() => {
    checkAdminAndLoad()
  }, [courseId])

  const checkAdminAndLoad = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setIsAdmin(profile?.role === 'admin')
    }
    await loadCourseData()
  }

  const loadCourseData = async () => {
    try {
      const supabase = createClient()

      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', courseId)
        .single()

      if (cursoError) throw cursoError
      setCourse(cursoData)

      const { data: modulosData, error: modulosError } = await supabase
        .from('modulos')
        .select('id, titulo, orden_index, sesiones(id, titulo, video_url, orden_index)')
        .eq('curso_id', courseId)
        .order('orden_index', { ascending: true })

      if (modulosError) throw modulosError

      const formatted = (modulosData || []).map(m => ({
        ...m,
        sesiones: ((m.sesiones as Sesion[]) || []).sort((a, b) => a.orden_index - b.orden_index),
      }))
      setModules(formatted)
    } catch (error) {
      console.error('[v0] Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalSesiones = () => modules.reduce((t, m) => t + m.sesiones.length, 0)

  // --- Module CRUD ---
  const openNewModule = () => {
    setEditingModule(null)
    setModuleTitle('')
    setModuleDialogOpen(true)
  }

  const openEditModule = (modulo: Modulo) => {
    setEditingModule(modulo)
    setModuleTitle(modulo.titulo)
    setModuleDialogOpen(true)
  }

  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) return toast.error('El título es obligatorio')
    setSavingModule(true)
    try {
      const payload = {
        action: editingModule ? 'update' : 'insert',
        table: 'modulos',
        data: {
          curso_id: courseId,
          titulo: moduleTitle.trim(),
          orden_index: editingModule?.orden_index ?? modules.length + 1,
        },
        ...(editingModule ? { id: editingModule.id } : {}),
      }
      const res = await fetch('/api/admin/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al guardar módulo')
      toast.success(editingModule ? 'Módulo actualizado' : 'Módulo creado')
      setModuleDialogOpen(false)
      await loadCourseData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingModule(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('¿Eliminar este módulo y todas sus sesiones?')) return
    try {
      const res = await fetch('/api/admin/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', table: 'modulos', id: moduleId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al eliminar')
      toast.success('Módulo eliminado')
      await loadCourseData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // --- Session CRUD ---
  const openNewSesion = (moduleId: string) => {
    setEditingSesion({ sesion: null, moduleId })
    setSesionTitle('')
    setSesionUrl('')
    setSesionDialogOpen(true)
  }

  const openEditSesion = (sesion: Sesion, moduleId: string) => {
    setEditingSesion({ sesion, moduleId })
    setSesionTitle(sesion.titulo)
    setSesionUrl(sesion.video_url)
    setSesionDialogOpen(true)
  }

  const handleSaveSesion = async () => {
    if (!sesionTitle.trim()) return toast.error('El título es obligatorio')
    if (!sesionUrl.trim()) return toast.error('La URL del video es obligatoria')
    const { sesion, moduleId } = editingSesion
    if (!moduleId) return
    setSavingSesion(true)
    try {
      const module = modules.find(m => m.id === moduleId)
      const payload = {
        action: sesion ? 'update' : 'insert',
        table: 'sesiones',
        data: {
          modulos_id: moduleId,
          titulo: sesionTitle.trim(),
          video_url: sesionUrl.trim(),
          orden_index: sesion?.orden_index ?? (module?.sesiones.length || 0) + 1,
        },
        ...(sesion ? { id: sesion.id } : {}),
      }
      const res = await fetch('/api/admin/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al guardar sesión')
      toast.success(sesion ? 'Sesión actualizada' : 'Sesión creada')
      setSesionDialogOpen(false)
      await loadCourseData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingSesion(false)
    }
  }

  const handleDeleteSesion = async (sesionId: string) => {
    if (!confirm('¿Eliminar esta sesión?')) return
    try {
      const res = await fetch('/api/admin/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', table: 'sesiones', id: sesionId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al eliminar')
      toast.success('Sesión eliminada')
      await loadCourseData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
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
              <ArrowLeft className="mr-2 h-4 w-4" />Volver a cursos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <Link href="/dashboard/courses">
        <Button variant="outline" size="sm" className="bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />Volver
        </Button>
      </Link>

      {/* Course Header */}
      <div className="grid gap-8 lg:grid-cols-3">
        {course.imagen_url && (
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-xl border shadow-lg">
              <img src={course.imagen_url} alt={course.titulo} className="aspect-video w-full object-cover" />
            </div>
          </div>
        )}
        <div className={course.imagen_url ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Badge className="mb-3 bg-primary/10 text-primary">{course.categoria}</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight">{course.titulo}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{course.descripcion}</p>
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
          {!isAdmin && getTotalSesiones() > 0 && (
            <div className="mt-6">
              <Link href={`/dashboard/courses/${courseId}/view`}>
                <Button size="lg" className="gap-2">
                  <PlayCircle className="h-5 w-5" />Ver Curso
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Contenido del Curso</CardTitle>
              <CardDescription>{modules.length} módulos • {getTotalSesiones()} sesiones</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={openNewModule} size="sm">
                <Plus className="mr-2 h-4 w-4" />Nuevo Módulo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <PlayCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium text-muted-foreground">Sin contenido aún</p>
              {isAdmin && (
                <Button onClick={openNewModule} variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />Crear primer módulo
                </Button>
              )}
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
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="h-7 w-7 bg-transparent p-0"
                            onClick={() => openEditModule(modulo)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 bg-transparent p-0"
                            onClick={() => handleDeleteModule(modulo.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-11 pr-4">
                      {isAdmin && (
                        <Button variant="outline" size="sm" className="w-full"
                          onClick={() => openNewSesion(modulo.id)}>
                          <Plus className="mr-2 h-4 w-4" />Añadir Sesión
                        </Button>
                      )}
                      {modulo.sesiones.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">No hay sesiones aún</p>
                      ) : (
                        <div className="space-y-2">
                          {modulo.sesiones.map((sesion, sesionIndex) => (
                            <div key={sesion.id}
                              className="group flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5">
                              <a href={sesion.video_url} target="_blank" rel="noopener noreferrer"
                                className="flex flex-1 items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                <p className="flex-1 font-medium group-hover:text-primary">
                                  {sesionIndex + 1}. {sesion.titulo}
                                </p>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              </a>
                              {isAdmin && (
                                <div className="ml-2 flex gap-1">
                                  <Button variant="outline" size="sm" className="h-7 w-7 bg-transparent p-0"
                                    onClick={() => openEditSesion(sesion, modulo.id)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-7 w-7 bg-transparent p-0"
                                    onClick={() => handleDeleteSesion(sesion.id)}>
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

      {/* Module Dialog — always mounted, controlled by state */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}</DialogTitle>
            <DialogDescription>Añade un módulo al curso</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mod-titulo">Título del Módulo</Label>
              <Input
                id="mod-titulo"
                value={moduleTitle}
                onChange={e => setModuleTitle(e.target.value)}
                placeholder="Ej: Introducción al Trading"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveModule} disabled={savingModule}>
                {savingModule ? 'Guardando...' : editingModule ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Dialog — always mounted, controlled by state */}
      <Dialog open={sesionDialogOpen} onOpenChange={setSesionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSesion.sesion ? 'Editar Sesión' : 'Nueva Sesión'}</DialogTitle>
            <DialogDescription>Añade una sesión con su video</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ses-titulo">Título de la Sesión</Label>
              <Input
                id="ses-titulo"
                value={sesionTitle}
                onChange={e => setSesionTitle(e.target.value)}
                placeholder="Ej: Introducción a Bitcoin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ses-url">URL del Video</Label>
              <Input
                id="ses-url"
                value={sesionUrl}
                onChange={e => setSesionUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSesionDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveSesion} disabled={savingSesion}>
                {savingSesion ? 'Guardando...' : editingSesion.sesion ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
