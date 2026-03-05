'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, ArrowLeft, Video, GripVertical, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Sesion {
  id: string
  titulo: string
  video_url: string
  orden_index: number
}

interface Module {
  id: string
  titulo: string
}

interface Course {
  id: string
  titulo: string
}

export default function ModuleLessonsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const moduleId = params.moduleId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSesion, setEditingSesion] = useState<Sesion | null>(null)

  useEffect(() => {
    loadData()
  }, [courseId, moduleId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load course info
      const { data: courseData } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', courseId)
        .single()
      setCourse(courseData)

      // Load module info
      const { data: moduleData } = await supabase
        .from('modulos')
        .select('*')
        .eq('id', moduleId)
        .single()
      setModule(moduleData)

      // Load sesiones
      const { data: sesionesData, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('modulos_id', moduleId)
        .order('orden_index', { ascending: true })

      if (error) throw error
      setSesiones(sesionesData || [])
    } catch (error) {
      console.error('[v0] Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const sesionData = {
      modulos_id: moduleId,
      titulo: formData.get('titulo') as string,
      video_url: formData.get('video_url') as string,
      orden_index: editingSesion?.orden_index || sesiones.length + 1
    }

    try {
      const supabase = createClient()

      if (editingSesion) {
        const { error } = await supabase
          .from('sesiones')
          .update(sesionData)
          .eq('id', editingSesion.id)

        if (error) throw error
        toast.success('Sesión actualizada')
      } else {
        const { error } = await supabase
          .from('sesiones')
          .insert([sesionData])

        if (error) throw error
        toast.success('Sesión creada')
      }

      setDialogOpen(false)
      setEditingSesion(null)
      loadData()
    } catch (error) {
      console.error('[v0] Error saving sesion:', error)
      toast.error('Error al guardar sesión')
    }
  }

  const handleDelete = async (sesionId: string) => {
    if (!confirm('¿Eliminar esta sesión?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sesiones')
        .delete()
        .eq('id', sesionId)

      if (error) throw error
      toast.success('Sesión eliminada')
      loadData()
    } catch (error) {
      console.error('[v0] Error deleting sesion:', error)
      toast.error('Error al eliminar sesión')
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Link href={`/admin/courses/${courseId}/modules`}>
          <Button variant="outline" size="sm" className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            {module?.titulo}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona las sesiones del módulo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSesion(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Sesión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSesion ? 'Editar Sesión' : 'Crear Nueva Sesión'}</DialogTitle>
              <DialogDescription>
                Completa la información de la sesión y añade el enlace del video
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título de la Sesión</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  defaultValue={editingSesion?.titulo}
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
                  defaultValue={editingSesion?.video_url}
                  placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  El video se abrirá en una nueva pestaña cuando los usuarios hagan clic
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSesion ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="text-muted-foreground">Cargando sesiones...</p>
          </div>
        </div>
      ) : sesiones.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
            <Video className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              No hay sesiones creadas
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Añade videos de YouTube o Vimeo para crear contenido
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Sesión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sesiones.map((sesion, index) => (
            <Card key={sesion.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          Sesión {index + 1}: {sesion.titulo}
                        </h3>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          {sesion.video_url && (
                            <a
                              href={sesion.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              Ver video <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSesion(sesion)
                            setDialogOpen(true)
                          }}
                          className="bg-transparent"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sesion.id)}
                          className="bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
