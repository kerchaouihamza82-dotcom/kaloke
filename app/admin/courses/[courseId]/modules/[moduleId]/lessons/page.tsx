'use client'

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, ArrowLeft, Video, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  getCourse,
  getModule,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  type Course,
  type Module,
  type Lesson,
} from '@/lib/fake-store'

export default function ModuleLessonsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const moduleId = params.moduleId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [mod, setMod] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [courseData, moduleData, lessonsData] = await Promise.all([
        getCourse(courseId),
        getModule(moduleId),
        getLessons(moduleId),
      ])
      setCourse(courseData)
      setMod(moduleData)
      setLessons(lessonsData)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [courseId, moduleId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const lessonData = {
      module_id: moduleId,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || '',
      video_url: (formData.get('video_url') as string) || '',
      order_index: editingLesson?.order_index ?? lessons.length + 1,
    }

    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, {
          title: lessonData.title,
          description: lessonData.description,
          video_url: lessonData.video_url,
        })
        toast.success('Leccion actualizada')
      } else {
        await createLesson(lessonData)
        toast.success('Leccion creada')
      }

      setDialogOpen(false)
      setEditingLesson(null)
      loadData()
    } catch (error) {
      toast.error('Error al guardar leccion')
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Eliminar esta leccion?')) return

    try {
      await deleteLesson(lessonId)
      toast.success('Leccion eliminada')
      loadData()
    } catch (error) {
      toast.error('Error al eliminar leccion')
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
            {mod?.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona las lecciones del modulo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingLesson(null)
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLesson(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Leccion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Editar Leccion' : 'Crear Nueva Leccion'}</DialogTitle>
              <DialogDescription>
                Completa la informacion de la leccion y el enlace del video
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo de la Leccion</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingLesson?.title}
                  key={editingLesson?.id ?? 'new'}
                  placeholder="Ej: Introduccion a Bitcoin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={editingLesson?.description}
                  key={`desc-${editingLesson?.id ?? 'new'}`}
                  placeholder="Breve descripcion de la leccion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">URL del Video (Mega, YouTube, Vimeo, etc.)</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  defaultValue={editingLesson?.video_url}
                  key={`url-${editingLesson?.id ?? 'new'}`}
                  placeholder="https://mega.nz/file/... o cualquier enlace de video"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Pega cualquier enlace externo de video: Mega, YouTube, Vimeo, Google Drive, etc.
                </p>
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
              Agrega videos con enlaces externos para crear contenido
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Leccion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          Leccion {index + 1}: {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                        )}
                        {lesson.video_url && (
                          <div className="mt-2">
                            <a
                              href={lesson.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              Ver video <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
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
