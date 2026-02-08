'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface NewLessonDialogProps {
  moduleId: string
  onLessonCreated?: () => void
}

export function NewLessonDialog({ moduleId, onLessonCreated }: NewLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'video' | 'pdf' | 'text' | 'file'>('video')
  const [content, setContent] = useState('')
  const [duration, setDuration] = useState('10')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[v0] Creating lesson:', { title, type, content, moduleId })
    
    if (!title || !content) {
      console.log('[v0] Missing required fields')
      return
    }
    
    const lessonId = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}`
    const newLesson = {
      id: lessonId,
      title,
      description,
      type,
      content,
      duration: type === 'video' ? `${duration}min` : undefined,
      completed: false,
      createdAt: new Date().toISOString()
    }

    console.log('[v0] New lesson object:', newLesson)

    // Guardar en localStorage
    try {
      const key = `module_${moduleId}_lessons`
      const existing = localStorage.getItem(key)
      const lessons = existing ? JSON.parse(existing) : []
      lessons.push(newLesson)
      localStorage.setItem(key, JSON.stringify(lessons))
      console.log('[v0] Lesson saved successfully')
      
      // Reset y cerrar
      setTitle('')
      setDescription('')
      setType('video')
      setContent('')
      setDuration('10')
      setOpen(false)
      
      // Notificar al padre
      if (onLessonCreated) {
        console.log('[v0] Calling onLessonCreated callback')
        onLessonCreated()
      }
    } catch (error) {
      console.error('[v0] Error saving lesson:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Lección
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Lección</DialogTitle>
          <DialogDescription>
            Agrega una nueva lección al módulo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Lección</Label>
              <Input
                id="title"
                placeholder="Ej: ¿Qué es Bitcoin?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el contenido de la lección..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Contenido</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="file">Archivo (ZIP, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">
                {type === 'video' && 'URL del Video (YouTube, Vimeo, etc.)'}
                {type === 'pdf' && 'URL del PDF'}
                {type === 'text' && 'Contenido de Texto'}
                {type === 'file' && 'URL del Archivo'}
              </Label>
              {type === 'text' ? (
                <Textarea
                  id="content"
                  placeholder="Escribe el contenido de la lección..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              ) : (
                <Input
                  id="content"
                  placeholder="https://..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Lección</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
