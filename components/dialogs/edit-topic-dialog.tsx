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
import { Edit } from 'lucide-react'

interface EditTopicDialogProps {
  topic: {
    id: string
    name: string
    description: string
    icon: string
  }
  onTopicUpdated: () => void
}

export function EditTopicDialog({ topic, onTopicUpdated }: EditTopicDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(topic.name)
  const [description, setDescription] = useState(topic.description)
  const [icon, setIcon] = useState(topic.icon)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (name && description) {
      const saved = localStorage.getItem('academy_topics')
      const topics = saved ? JSON.parse(saved) : []
      
      const updatedTopics = topics.map((t: any) => 
        t.id === topic.id 
          ? { ...t, name, description, icon: icon || '📚' }
          : t
      )
      
      localStorage.setItem('academy_topics', JSON.stringify(updatedTopics))
      onTopicUpdated()
      setOpen(false)
    }
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este tema? Esto eliminará todos los cursos asociados.')) {
      const saved = localStorage.getItem('academy_topics')
      const topics = saved ? JSON.parse(saved) : []
      const filtered = topics.filter((t: any) => t.id !== topic.id)
      localStorage.setItem('academy_topics', JSON.stringify(filtered))
      onTopicUpdated()
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tema</DialogTitle>
          <DialogDescription>
            Modifica la información del tema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Tema</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bitcoin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aprende todo sobre Bitcoin..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icono (emoji)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="₿"
              />
            </div>
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
