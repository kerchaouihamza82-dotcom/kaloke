'use client'

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Video, ArrowLeft, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  getCourse,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getLessonsCountForModule,
  type Course,
  type Module,
} from '@/lib/fake-store'

interface ModuleWithCount extends Module {
  lessons_count: number
}

export default function CourseModulesPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)

  const loadData = useCallback(async () => {
    try {
      const courseData = await getCourse(courseId)
      setCourse(courseData)

      const modulesData = await getModules(courseId)
      const withCounts = await Promise.all(
        modulesData.map(async (m) => ({
          ...m,
          lessons_count: await getLessonsCountForModule(m.id),
        }))
      )
      setModules(withCounts)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const moduleData = {
      course_id: courseId,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || '',
      order_index: editingModule?.order_index ?? modules.length + 1,
    }

    try {
      if (editingModule) {
        await updateModule(editingModule.id, {
          title: moduleData.title,
          description: moduleData.description,
        })
        toast.success('Modulo actualizado')
      } else {
        await createModule(moduleData)
        toast.success('Modulo creado')
      }

      setDialogOpen(false)
      setEditingModule(null)
      loadData()
    } catch (error) {
      toast.error('Error al guardar modulo')
    }
  }

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Eliminar este modulo y todas sus lecciones?')) return

    try {
      await deleteModule(moduleId)
      toast.success('Modulo eliminado')
      loadData()
    } catch (error) {
      toast.error('Error al eliminar modulo')
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="outline" size="sm" className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            {course?.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona los modulos del curso
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingModule(null)
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingModule(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Modulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Editar Modulo' : 'Crear Nuevo Modulo'}</DialogTitle>
              <DialogDescription>
                Completa la informacion del modulo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo del Modulo</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingModule?.title}
                  key={editingModule?.id ?? 'new'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingModule?.description}
                  key={`desc-${editingModule?.id ?? 'new'}`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingModule ? 'Actualizar' : 'Crear'}
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
            <p className="text-muted-foreground">Cargando modulos...</p>
          </div>
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
            <p className="mb-4 text-lg font-medium text-muted-foreground">
              No hay modulos creados
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Modulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Modulo {index + 1}: {module.title}
                        </CardTitle>
                        {module.description && (
                          <CardDescription className="mt-1">{module.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingModule(module)
                            setDialogOpen(true)
                          }}
                          className="bg-transparent"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                          className="bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {module.lessons_count} lecciones
                  </span>
                  <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
                    <Button size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Gestionar Lecciones
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
