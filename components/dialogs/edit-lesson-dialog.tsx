'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit } from 'lucide-react'

interface EditLessonDialogProps {
  lesson: {
    id: string
    title: string
    description: string
    type: string
    content: string
    duration?: string
  }
  moduleId: string
  onLessonUpdated: () => void
}

export function EditLessonDialog({ lesson, moduleId, onLessonUpdated }: EditLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description)
  const [type, setType] = useState(lesson.type)
  const [content, setContent] = useState(lesson.content)
  const [duration, setDuration] = useState(lesson.duration?.replace('min', '') || '10')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[v0] Editing lesson:', { title, type, content, moduleId })
    
    if (title && content) {
      const key = `module_${moduleId}_lessons`
      const saved = localStorage.getItem(key)
      const lessons = saved ? JSON.parse(saved) : []
      
      console.log('[v0] Current lessons:', lessons)
      
      const updatedLessons = lessons.map((l: any) => 
        l.id === lesson.id 
          ? { 
              ...l, 
              title, 
              description, 
              type, 
              content,
              duration: type === 'video' ? `${duration}min` : undefined
            }
          : l
      )
      
      console.log('[v0] Updated lessons:', updatedLessons)
      localStorage.setItem(key, JSON.stringify(updatedLessons))
      onLessonUpdated()
      setOpen(false)
      console.log('[v0] Lesson updated successfully')
    }
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta lección?')) {
      const key = `module_${moduleId}_lessons`
      const saved = localStorage.getItem(key)
      const lessons = saved ? JSON.parse(saved) : []
      const filtered = lessons.filter((l: any) => l.id !== lesson.id)
      localStorage.setItem(key, JSON.stringify(filtered))
      onLessonUpdated()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Lección</DialogTitle>
          <DialogDescription>
            Modifica la información de la lección
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la lección</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de contenido</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="file">Archivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">
                {type === 'video' ? 'URL del video' : 
                 type === 'pdf' ? 'URL del PDF' : 
                 type === 'file' ? 'URL del archivo' : 
                 'Contenido de texto'}
              </Label>
              {type === 'text' ? (
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              ) : (
                <Input
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://..."
                  required
                />
              )}
            </div>
            {type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between gap-2">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
