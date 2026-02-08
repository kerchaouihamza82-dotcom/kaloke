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

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  video_type: 'youtube' | 'vimeo' | 'other'
  duration_minutes: number
  order_index: number
  content: string
}

interface Module {
  id: string
  title: string
}

interface Course {
  id: string
  title: string
}

export default function ModuleLessonsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const moduleId = params.moduleId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    loadData()
  }, [courseId, moduleId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load course info
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()
      setCourse(courseData)

      // Load module info
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()
      setModule(moduleData)

      // Load lessons
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setLessons(lessonsData || [])
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
    
    const lessonData = {
      module_id: moduleId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      video_url: formData.get('video_url') as string,
      video_type: formData.get('video_type') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
      content: formData.get('content') as string,
      order_index: editingLesson?.order_index || lessons.length + 1
    }

    try {
      const supabase = createClient()

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id)

        if (error) throw error
        toast.success('Lección actualizada')
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert([lessonData])

        if (error) throw error
        toast.success('Lección creada')
      }

      setDialogOpen(false)
      setEditingLesson(null)
      loadData()
    } catch (error) {
      console.error('[v0] Error saving lesson:', error)
      toast.error('Error al guardar lección')
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm('¿Eliminar esta lección?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error
      toast.success('Lección eliminada')
      loadData()
    } catch (error) {
      console.error('[v0] Error deleting lesson:', error)
      toast.error('Error al eliminar lección')
    }
  }

  const getVideoIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return '📺'
      case 'vimeo':
        return '🎬'
      default:
        return '🎥'
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
            {module?.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona las lecciones del módulo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLesson(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Lección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Editar Lección' : 'Crear Nueva Lección'}</DialogTitle>
              <DialogDescription>
                Completa la información de la lección y añade el enlace del video
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Lección</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingLesson?.title}
                  placeholder="Ej: Introducción a Bitcoin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={editingLesson?.description}
                  placeholder="Breve descripción de la lección"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="video_url">URL del Video</Label>
                  <Input
                    id="video_url"
                    name="video_url"
                    type="url"
                    defaultValue={editingLesson?.video_url}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Soporta: YouTube, Vimeo y otros enlaces de video
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_type">Tipo de Video</Label>
                  <Select name="video_type" defaultValue={editingLesson?.video_type || 'youtube'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">📺 YouTube</SelectItem>
                      <SelectItem value="vimeo">🎬 Vimeo</SelectItem>
                      <SelectItem value="other">🎥 Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="1"
                  defaultValue={editingLesson?.duration_minutes}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenido / Notas</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={5}
                  defaultValue={editingLesson?.content}
                  placeholder="Añade notas, recursos o contenido adicional para la lección..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLesson ? 'Actualizar' : 'Crear'}
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
            <p className="text-muted-foreground">Cargando lecciones...</p>
          </div>
        </div>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
            <Video className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              No hay lecciones creadas
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Añade videos de YouTube o Vimeo para crear contenido
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Lección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-lg">{getVideoIcon(lesson.video_type)}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          Lección {index + 1}: {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          {lesson.duration_minutes > 0 && (
                            <span>⏱️ {lesson.duration_minutes} min</span>
                          )}
                          <span className="capitalize">{lesson.video_type}</span>
                          {lesson.video_url && (
                            <a
                              href={lesson.video_url}
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
                            setEditingLesson(lesson)
                            setDialogOpen(true)
                          }}
                          className="bg-transparent"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(lesson.id)}
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
