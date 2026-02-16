'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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

interface Module {
  id: string
  titulo: string
  orden_index: number
  sesiones_count?: number
}

interface Course {
  id: string
  titulo: string
  descripcion: string
}

export default function CourseModulesPage() {
  const params = useParams()
  const courseId = params.courseId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load course info
      const { data: courseData, error: courseError } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modulos')
        .select(`
          *,
          sesiones:sesiones(count)
        `)
        .eq('curso_id', courseId)
        .order('orden_index', { ascending: true })

      if (modulesError) throw modulesError

      const formattedModules = modulesData?.map(module => ({
        ...module,
        sesiones_count: module.sesiones?.[0]?.count || 0
      }))

      setModules(formattedModules || [])
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

      setDialogOpen(false)
      setEditingModule(null)
      loadData()
    } catch (error) {
      console.error('[v0] Error saving module:', error)
      toast.error('Error al guardar módulo')
    }
  }

  const handleDelete = async (moduleId: string) => {
    if (!confirm('¿Eliminar este módulo y todas sus sesiones?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('modulos')
        .delete()
        .eq('id', moduleId)

      if (error) throw error
      toast.success('Módulo eliminado')
      loadData()
    } catch (error) {
      console.error('[v0] Error deleting module:', error)
      toast.error('Error al eliminar módulo')
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
            {course?.titulo}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona los módulos del curso
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingModule(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}</DialogTitle>
              <DialogDescription>
                Completa la información del módulo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="text-muted-foreground">Cargando módulos...</p>
          </div>
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
            <p className="mb-4 text-lg font-medium text-muted-foreground">
              No hay módulos creados
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Módulo
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
                          Módulo {index + 1}: {module.titulo}
                        </CardTitle>
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
                    {module.sesiones_count || 0} sesiones
                  </span>
                  <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
                    <Button size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Gestionar Sesiones
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
