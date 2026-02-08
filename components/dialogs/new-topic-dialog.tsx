'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NewTopicDialogProps {
  onTopicCreated?: () => void
}

export function NewTopicDialog({ onTopicCreated }: NewTopicDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !description) return
    
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // Verificar que el usuario está autenticado
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[v0] Current user:', user?.id)
      
      if (!user) {
        alert('Debes estar autenticado para crear temas')
        return
      }
      
      // Verificar el rol del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      console.log('[v0] User profile:', profile)
      
      if (profile?.role !== 'admin') {
        alert('Solo los administradores pueden crear temas')
        return
      }
      
      const slug = name.toLowerCase().replace(/\s+/g, '-')
      
      const { data, error } = await supabase
        .from('topics')
        .insert({
          name,
          slug,
          description,
          icon: icon || '📚',
          color: 'bg-primary/10 text-primary',
          order_index: 0
        })
        .select()
      
      console.log('[v0] Insert result:', { data, error })
      
      if (error) {
        console.error('[v0] Error creating topic:', error)
        alert(`Error al crear el tema: ${error.message}\n\nCódigo: ${error.code}\nDetalles: ${error.details}`)
        return
      }
      
      // Reset form
      setName('')
      setDescription('')
      setIcon('')
      setOpen(false)
      
      // Notificar al padre
      onTopicCreated?.()
    } catch (error) {
      console.error('[v0] Error:', error)
      alert('Error inesperado al crear el tema')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tema
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tema</DialogTitle>
            <DialogDescription>
              Agrega un nuevo tema o nicho de contenido a la academia
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Tema</Label>
              <Input
                id="name"
                placeholder="Ej: Bitcoin, Trading, DeFi..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el contenido de este tema..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icono (emoji)</Label>
              <Input
                id="icon"
                placeholder="📚 (opcional)"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Tema'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
