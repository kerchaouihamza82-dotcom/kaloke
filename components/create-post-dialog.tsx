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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface CreatePostDialogProps {
  onPostCreated?: () => void
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para crear publicaciones',
          variant: 'destructive',
        })
        return
      }

      const authorName = user.user_metadata?.display_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'Usuario'

      const { error } = await supabase.from('posts').insert({
        title: title.trim(),
        content: content.trim(),
        category,
        author_name: authorName,
        author_id: user.id,
      })

      if (error) throw error

      toast({
        title: 'Publicación creada',
        description: 'Tu publicación ha sido publicada exitosamente',
      })

      setTitle('')
      setContent('')
      setCategory('')
      setOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error('[v0] Error creating post:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear la publicación',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear publicación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva publicación</DialogTitle>
            <DialogDescription>
              Comparte tus conocimientos con la comunidad
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="¿De qué trata tu publicación?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trading">Trading</SelectItem>
                  <SelectItem value="DeFi">DeFi</SelectItem>
                  <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="Ethereum">Ethereum</SelectItem>
                  <SelectItem value="NFTs">NFTs</SelectItem>
                  <SelectItem value="Análisis">Análisis</SelectItem>
                  <SelectItem value="Tutoriales">Tutoriales</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                placeholder="Comparte tus ideas..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length}/1000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
