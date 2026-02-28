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
import { Plus, Pencil, Trash2, FolderOpen, Video } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { adminWrite } from '@/lib/admin-write'

interface Course {
  id: string
  titulo: string
  descripcion: string
  instructor: string
  categoria: string
  url_del_curso?: string
  fecha_creacion?: string
  modules_count?: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          modulos:modulos(count)
        `)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      const formattedCourses = data?.map(course => ({
        ...course,
        modules_count: course.modulos?.[0]?.count || 0
      }))

      setCourses(formattedCourses || [])
    } catch (error) {
      console.error('[v0] Error loading courses:', error)
      toast.error('Error al cargar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const courseData = {
      titulo: formData.get('titulo') as string,
      descripcion: formData.get('descripcion') as string,
      instructor: formData.get('instructor') as string,
      categoria: formData.get('categoria') as string,
      url_del_curso: formData.get('url_del_curso') as string || null,
      fecha_creacion: new Date().toISOString()
    }

    try {
      if (editingCourse) {
        const { error } = await adminWrite({
          action: 'update',
          table: 'cursos',
          data: courseData,
          id: editingCourse.id,
        })
        if (error) throw new Error(error)
        toast.success('Curso actualizado exitosamente')
      } else {
        const { error } = await adminWrite({
          action: 'insert',
          table: 'cursos',
          data: courseData,
        })
        if (error) throw new Error(error)
        toast.success('Curso creado exitosamente')
      }

      setDialogOpen(false)
      setEditingCourse(null)
      loadCourses()
    } catch (error) {
      console.error('[v0] Error saving course:', error)
      toast.error('Error al guardar curso')
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso? Se eliminarán todos sus módulos y sesiones.')) return

    try {
      const { error } = await adminWrite({ action: 'delete', table: 'cursos', id: courseId })
      if (error) throw new Error(error)
      toast.success('Curso eliminado')
      loadCourses()
    } catch (error) {
      console.error('[v0] Error deleting course:', error)
      toast.error('Error al eliminar curso')
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Gestión de Cursos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Administra los cursos de la plataforma
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                Completa la información del curso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título del Curso</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  defaultValue={editingCourse?.titulo}
                  placeholder="Ej: Fundamentos de Trading"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  defaultValue={editingCourse?.descripcion}
                  placeholder="Describe el contenido del curso..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    name="instructor"
                    defaultValue={editingCourse?.instructor}
                    placeholder="Nombre del instructor"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    name="categoria"
                    defaultValue={editingCourse?.categoria}
                    placeholder="Ej: Trading, Inversión"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url_del_curso">URL del Curso (opcional)</Label>
                <Input
                  id="url_del_curso"
                  name="url_del_curso"
                  type="url"
                  defaultValue={editingCourse?.url_del_curso}
                  placeholder="https://..."
                />
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
                    <CardTitle className="text-lg">{course.titulo}</CardTitle>
                    <CardDescription className="mt-1">{course.descripcion}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span className="font-medium">{course.categoria}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Módulos:</span>
                    <span className="font-medium">{course.modules_count || 0}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/courses/${course.id}/modules`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Módulos
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
