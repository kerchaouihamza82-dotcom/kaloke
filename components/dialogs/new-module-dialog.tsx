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
import { Plus } from 'lucide-react'

interface NewModuleDialogProps {
  courseId: string
  onModuleCreated?: () => void
}

export function NewModuleDialog({ courseId, onModuleCreated }: NewModuleDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState('1')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const moduleId = name.toLowerCase().replace(/\s+/g, '-')
    const newModule = {
      id: moduleId,
      name,
      description,
      order: parseInt(order),
      lessonsCount: 0,
      duration: '0h',
      createdAt: new Date().toISOString()
    }

    // Guardar en localStorage
    const key = `course_${courseId}_modules`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([...existing, newModule]))

    // Reset y cerrar
    setName('')
    setDescription('')
    setOrder('1')
    setOpen(false)
    
    if (onModuleCreated) {
      onModuleCreated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Módulo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Módulo</DialogTitle>
          <DialogDescription>
            Agrega un nuevo módulo al curso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Módulo</Label>
              <Input
                id="name"
                placeholder="Ej: Introducción a Bitcoin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el contenido del módulo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Módulo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
