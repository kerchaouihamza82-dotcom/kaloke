'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ArrowLeft, PlayCircle, ExternalLink, User, Plus, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Sesion { id: string; titulo: string; video_url: string; orden_index: number }
interface Modulo { id: string; titulo: string; orden_index: number; sesiones: Sesion[] }
interface Course { id: string; titulo: string; descripcion: string; instructor: string; categoria: string; url_del_curso?: string; imagen_url?: string }

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Modulo | null>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [savingModule, setSavingModule] = useState(false)

  // Session dialog
  const [sesionDialogOpen, setSesionDialogOpen] = useState(false)
  const [editingSesion, setEditingSesion] = useState<{ sesion: Sesion | null; moduleId: string | null }>({ sesion: null, moduleId: null })
  const [sesionTitle, setSesionTitle] = useState('')
  const [sesionUrl, setSesionUrl] = useState('')
  const [savingSesion, setSavingSesion] = useState(false)

  useEffect(() => {
    loadAll()
  }, [courseId])

  const getSupabase = () => createClient()

  const loadAll = async () => {
    const supabase = getSupabase()
    try {
      // Check admin
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setIsAdmin(profile?.role === 'admin')
      }

      // Load course
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos').select('*').eq('id', courseId).single()
      if (cursoError) throw cursoError
      setCourse(cursoData)

      // Load modules with sessions
      const { data: modulosData, error: modulosError } = await supabase
        .from('modulos')
        .select('id, titulo, orden_index, sesiones(id, titulo, video_url, orden_index)')
        .eq('curso_id', courseId)
        .order('orden_index', { ascending: true })
      if (modulosError) throw modulosError

      const formatted = (modulosData || []).map((m: any) => ({
        ...m,
        sesiones: (m.sesiones || []).sort((a: Sesion, b: Sesion) => a.orden_index - b.orden_index),
      }))
      setModules(formatted)
    } catch (error) {
      console.error('[v0] Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalSesiones = () => modules.reduce((t, m) => t + m.sesiones.length, 0)

  // ===== MODULE CRUD (direct Supabase) =====
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
    if (!moduleTitle.trim()) {
      toast.error('El titulo es obligatorio')
      return
    }
    setSavingModule(true)
    const supabase = getSupabase()
    try {
      if (editingModule) {
        const { error } = await supabase.from('modulos').update({ titulo: moduleTitle.trim() }).eq('id', editingModule.id)
        if (error) {
          console.error('[v0] Update module error:', error.message, error.code, error.details, error.hint)
          toast.error('Error: ' + error.message)
          return
        }
        toast.success('Modulo actualizado')
      } else {
        const insertData = { curso_id: courseId, titulo: moduleTitle.trim(), orden_index: modules.length + 1 }
        console.log('[v0] Inserting module:', JSON.stringify(insertData))
        const { data, error } = await supabase.from('modulos').insert([insertData]).select()
        console.log('[v0] Insert module result - data:', JSON.stringify(data), 'error:', error ? JSON.stringify({ msg: error.message, code: error.code, details: error.details, hint: error.hint }) : 'null')
        if (error) {
          toast.error('Error: ' + error.message)
          return
        }
        toast.success('Modulo creado correctamente')
      }
      setModuleDialogOpen(false)
      setEditingModule(null)
      setModuleTitle('')
      await loadAll()
    } catch (err: any) {
      console.error('[v0] Unexpected module error:', err)
      toast.error('Error inesperado: ' + err.message)
    } finally {
      setSavingModule(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Eliminar este modulo y todas sus sesiones?')) return
    const supabase = getSupabase()
    await supabase.from('sesiones').delete().eq('modulos_id', moduleId)
    const { error } = await supabase.from('modulos').delete().eq('id', moduleId)
    if (error) return toast.error('Error: ' + error.message)
    toast.success('Modulo eliminado')
    await loadAll()
  }

  // ===== SESSION CRUD (direct Supabase) =====
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
    if (!sesionTitle.trim()) {
      toast.error('El titulo es obligatorio')
      return
    }
    setSavingSesion(true)
    const supabase = getSupabase()
    try {
      if (editingSesion.sesion) {
        const { error } = await supabase.from('sesiones').update({ titulo: sesionTitle.trim(), video_url: sesionUrl.trim() }).eq('id', editingSesion.sesion.id)
        if (error) {
          console.error('[v0] Update sesion error:', error.message)
          toast.error('Error: ' + error.message)
          return
        }
        toast.success('Sesion actualizada')
      } else {
        const mod = modules.find(m => m.id === editingSesion.moduleId)
        const ordenIndex = (mod?.sesiones.length || 0) + 1
        const insertData = { modulos_id: editingSesion.moduleId!, titulo: sesionTitle.trim(), video_url: sesionUrl.trim(), orden_index: ordenIndex }
        console.log('[v0] Inserting sesion:', JSON.stringify(insertData))
        const { data, error } = await supabase.from('sesiones').insert([insertData]).select()
        console.log('[v0] Insert sesion result - data:', JSON.stringify(data), 'error:', error ? JSON.stringify({ msg: error.message, code: error.code }) : 'null')
        if (error) {
          toast.error('Error: ' + error.message)
          return
        }
        toast.success('Sesion creada correctamente')
      }
      setSesionDialogOpen(false)
      setEditingSesion({ sesion: null, moduleId: null })
      setSesionTitle('')
      setSesionUrl('')
      await loadAll()
    } catch (err: any) {
      console.error('[v0] Unexpected sesion error:', err)
      toast.error('Error inesperado: ' + err.message)
    } finally {
      setSavingSesion(false)
    }
  }

  const handleDeleteSesion = async (e: React.MouseEvent, sesionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Eliminar esta sesion?')) return
    const supabase = getSupabase()
    const { error } = await supabase.from('sesiones').delete().eq('id', sesionId)
    if (error) return toast.error('Error: ' + error.message)
    toast.success('Sesion eliminada')
    await loadAll()
  }

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Curso no encontrado</h2>
        <Link href="/dashboard/courses"><Button variant="outline" className="mt-4">Volver a cursos</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />{'Volver a cursos'}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {course.imagen_url && (
          <div className="overflow-hidden rounded-xl">
            <img src={course.imagen_url} alt={course.titulo} className="aspect-video w-full object-cover" />
          </div>
        )}
        <div className={course.imagen_url ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Badge className="mb-3 bg-primary/10 text-primary">{course.categoria}</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight">{course.titulo}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{course.descripcion}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><User className="h-4 w-4" /><span>{'Instructor: ' + course.instructor}</span></div>
            <div className="flex items-center gap-1"><PlayCircle className="h-4 w-4" /><span>{getTotalSesiones() + ' sesiones'}</span></div>
          </div>
          {!isAdmin && getTotalSesiones() > 0 && (
            <div className="mt-6">
              <Link href={'/dashboard/courses/' + courseId + '/view'}>
                <Button size="lg" className="gap-2"><PlayCircle className="h-5 w-5" />{'Ver Curso'}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{'Contenido del Curso'}</CardTitle>
              <CardDescription>{modules.length + ' modulos - ' + getTotalSesiones() + ' sesiones'}</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={openNewModule} size="sm"><Plus className="mr-2 h-4 w-4" />{'Nuevo Modulo'}</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <PlayCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium text-muted-foreground">{'Sin contenido'}</p>
              {isAdmin && (
                <Button onClick={openNewModule} variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />{'Crear primer modulo'}
                </Button>
              )}
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {modules.map((modulo, idx) => (
                <AccordionItem key={modulo.id} value={modulo.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex w-full items-center justify-between pr-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{idx + 1}</div>
                        <div>
                          <h3 className="font-semibold">{modulo.titulo}</h3>
                          <p className="text-xs text-muted-foreground">{modulo.sesiones.length + ' sesiones'}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="h-7 w-7 bg-transparent p-0" onClick={() => openEditModule(modulo)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 bg-transparent p-0" onClick={() => handleDeleteModule(modulo.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-11 pr-4">
                      {isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => openNewSesion(modulo.id)} className="w-full">
                          <Plus className="mr-2 h-4 w-4" />{'Agregar sesion'}
                        </Button>
                      )}
                      {modulo.sesiones.map((sesion, sIdx) => (
                        <div key={sesion.id} className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{sIdx + 1}</span>
                            <div>
                              <p className="font-medium">{sesion.titulo}</p>
                              {sesion.video_url && (
                                <a href={sesion.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                                  <ExternalLink className="h-3 w-3" />{'Ver video'}
                                </a>
                              )}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="ml-2 flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditSesion(sesion, modulo.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => handleDeleteSesion(e, sesion.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          )}
                        </div>
                      ))}
                      {modulo.sesiones.length === 0 && !isAdmin && (
                        <p className="py-4 text-center text-sm text-muted-foreground">{'Proximamente...'}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Editar Modulo' : 'Nuevo Modulo'}</DialogTitle>
            <DialogDescription>{editingModule ? 'Modifica el titulo del modulo' : 'Crea un nuevo modulo para este curso'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="mod-title">{'Titulo del modulo'}</Label>
              <Input id="mod-title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="Ej: Introduccion" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>{'Cancelar'}</Button>
            <Button onClick={handleSaveModule} disabled={savingModule}>
              {savingModule ? 'Guardando...' : (editingModule ? 'Actualizar' : 'Crear Modulo')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={sesionDialogOpen} onOpenChange={setSesionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSesion.sesion ? 'Editar Sesion' : 'Nueva Sesion'}</DialogTitle>
            <DialogDescription>{editingSesion.sesion ? 'Modifica la sesion' : 'Crea una nueva sesion en este modulo'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ses-title">{'Titulo'}</Label>
              <Input id="ses-title" value={sesionTitle} onChange={e => setSesionTitle(e.target.value)} placeholder="Ej: Clase 1" />
            </div>
            <div>
              <Label htmlFor="ses-url">{'URL del video'}</Label>
              <Input id="ses-url" value={sesionUrl} onChange={e => setSesionUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSesionDialogOpen(false)}>{'Cancelar'}</Button>
            <Button onClick={handleSaveSesion} disabled={savingSesion}>
              {savingSesion ? 'Guardando...' : (editingSesion.sesion ? 'Actualizar' : 'Crear Sesion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
