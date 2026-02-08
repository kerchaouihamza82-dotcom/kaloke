'use client'

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  modules_count?: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const loadCourses = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('courses')
        .select('*, modules(count)')
        .order('created_at', { ascending: false })

      if (error) throw error

      const coursesWithCount = (data || []).map((c: any) => ({
        ...c,
        modules_count: c.modules?.[0]?.count || 0,
      }))

      setCourses(coursesWithCount)
    } catch (error) {
      toast.error('Error al cargar cursos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const courseData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      level: formData.get('level') as string,
      duration_hours: parseFloat(formData.get('duration_hours') as string),
    }

    try {
      const supabase = createClient()

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id)

        if (error) throw error
        toast.success('Curso actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData)

        if (error) throw error
        toast.success('Curso creado exitosamente')
      }

      setDialogOpen(false)
      setEditingCourse(null)
      loadCourses()
    } catch (error) {
      toast.error('Error al guardar curso')
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Estas seguro de eliminar este curso? Se eliminaran todos sus modulos y lecciones.')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('courses').delete().eq('id', courseId)
      if (error) throw error
      toast.success('Curso eliminado')
      loadCourses()
    } catch (error) {
      toast.error('Error al eliminar curso')
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Gestion de Cursos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Administra los cursos de la plataforma
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingCourse(null)
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}</DialogTitle>
              <DialogDescription>
                Completa la informacion del curso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo del Curso</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingCourse?.title}
                  key={editingCourse?.id ?? 'new'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingCourse?.description}
                  key={`desc-${editingCourse?.id ?? 'new'}`}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Select name="level" defaultValue={editingCourse?.level || 'beginner'} key={`lvl-${editingCourse?.id ?? 'new'}`} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duracion (horas)</Label>
                  <Input
                    id="duration_hours"
                    name="duration_hours"
                    type="number"
                    step="0.5"
                    defaultValue={editingCourse?.duration_hours}
                    key={`dur-${editingCourse?.id ?? 'new'}`}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Actualizar' : 'Crear'}
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
            <p className="text-muted-foreground">Cargando cursos...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
            <p className="mb-4 text-lg font-medium text-muted-foreground">
              No hay cursos creados
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="mt-1">{course.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span className="font-medium capitalize">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duracion:</span>
                    <span className="font-medium">{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Modulos:</span>
                    <span className="font-medium">{course.modules_count}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/courses/${course.id}/modules`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Modulos
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCourse(course)
                        setDialogOpen(true)
                      }}
                      className="bg-transparent"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                      className="bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
