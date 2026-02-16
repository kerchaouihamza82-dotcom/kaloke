'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, User, Plus, Pencil, Trash2, Upload, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useAdmin } from "@/hooks/use-admin"
import { toast } from "sonner"
import { upload } from '@vercel/blob/client'

interface Curso {
  id: string
  titulo: string
  descripcion: string
  instructor: string
  categoria: string
  fecha_creacion: string
  imagen_url?: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Curso | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isAdmin } = useAdmin()

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (editingCourse?.imagen_url) {
      setImagePreview(editingCourse.imagen_url)
    } else {
      setImagePreview(null)
    }
  }, [editingCourse])

  const loadCourses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('fecha_creacion', { ascending: false })
      
      if (error) {
        console.error('[v0] Error loading courses:', error)
        return
      }
      
      setCourses(data || [])
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formData = new FormData(e.currentTarget)
      let imagenUrl = editingCourse?.imagen_url || null

      // Upload image if a new one was selected
      const fileInput = fileInputRef.current
      const file = fileInput?.files?.[0]
      
      if (file) {
        try {
          const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          })
          imagenUrl = newBlob.url
        } catch (uploadError) {
          console.error('[v0] Error uploading image:', uploadError)
          toast.error('Error al subir la imagen')
          setUploading(false)
          return
        }
      }

      const courseData = {
        titulo: formData.get('titulo') as string,
        descripcion: formData.get('descripcion') as string,
        instructor: formData.get('instructor') as string,
        categoria: formData.get('categoria') as string,
        url_del_curso: formData.get('url_del_curso') as string || null,
        imagen_url: imagenUrl,
        fecha_creacion: editingCourse?.fecha_creacion || new Date().toISOString()
      }

      const supabase = createClient()

      if (editingCourse) {
        const { error } = await supabase
          .from('cursos')
          .update(courseData)
          .eq('id', editingCourse.id)

        if (error) throw error
        toast.success('Curso actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('cursos')
          .insert([courseData])

        if (error) throw error
        toast.success('Curso creado exitosamente')
      }

      setDialogOpen(false)
      setEditingCourse(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadCourses()
    } catch (error) {
      console.error('[v0] Error saving course:', error)
      toast.error('Error al guardar curso')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('¿Estás seguro de eliminar este curso? Se eliminarán todos sus módulos y sesiones.')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', courseId)

      if (error) throw error
      toast.success('Curso eliminado')
      loadCourses()
    } catch (error) {
      console.error('[v0] Error deleting course:', error)
      toast.error('Error al eliminar curso')
    }
  }

  const handleEdit = (e: React.MouseEvent, course: Curso) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingCourse(course)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Cursos Disponibles
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explora nuestro catálogo de cursos y comienza a aprender
          </p>
        </div>
        {isAdmin && (
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
                  <Label htmlFor="imagen">Imagen del Curso</Label>
                  <div className="flex flex-col gap-4">
                    {imagePreview ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => {
                            setImagePreview(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            No hay imagen seleccionada
                          </p>
                        </div>
                      </div>
                    )}
                    <Input
                      ref={fileInputRef}
                      id="imagen"
                      name="imagen"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos: JPG, PNG, WEBP. Máximo 5MB
                    </p>
                  </div>
                </div>
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false)
                      setImagePreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    disabled={uploading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      editingCourse ? 'Actualizar' : 'Crear'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Grid de Cursos */}
      {courses.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            No hay cursos disponibles
          </p>
          <p className="text-sm text-muted-foreground">
            Los cursos aparecerán aquí cuando estén disponibles
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                {course.imagen_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={course.imagen_url}
                      alt={course.titulo}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className="bg-primary/10 text-primary">
                      {course.categoria}
                    </Badge>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleEdit(e, course)}
                          className="h-7 w-7 bg-transparent p-0"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDelete(e, course.id)}
                          className="h-7 w-7 bg-transparent p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-2">{course.titulo}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                  </div>
                  <Button className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Ver Curso
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
