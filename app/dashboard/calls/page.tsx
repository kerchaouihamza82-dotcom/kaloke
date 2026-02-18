'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Video, Plus, Pencil, Trash2 } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface LiveCall {
  id: string
  titulo: string
  fecha: string
  hora: string
  enlace: string
  created_at: string
}

export default function CallsPage() {
  const { isAdmin } = useAdmin()
  const [calls, setCalls] = useState<LiveCall[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCall, setEditingCall] = useState<LiveCall | null>(null)

  useEffect(() => {
    loadCalls()
  }, [])

  const loadCalls = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('live_calls')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
      
      if (error) {
        console.error('[v0] Error loading calls:', error)
        return
      }
      
      setCalls(data || [])
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const callData = {
      titulo: formData.get('titulo') as string,
      fecha: formData.get('fecha') as string,
      hora: formData.get('hora') as string,
      enlace: formData.get('enlace') as string,
    }

    try {
      const supabase = createClient()

      if (editingCall) {
        const { error } = await supabase
          .from('live_calls')
          .update(callData)
          .eq('id', editingCall.id)

        if (error) throw error
        toast.success('Llamada actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('live_calls')
          .insert([callData])

        if (error) throw error
        toast.success('Llamada creada exitosamente')
      }

      setDialogOpen(false)
      setEditingCall(null)
      loadCalls()
    } catch (error) {
      console.error('[v0] Error saving call:', error)
      toast.error('Error al guardar llamada')
    }
  }

  const handleEdit = (call: LiveCall) => {
    setEditingCall(call)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta llamada?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('live_calls')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Llamada eliminada exitosamente')
      loadCalls()
    } catch (error) {
      console.error('[v0] Error deleting call:', error)
      toast.error('Error al eliminar llamada')
    }
  }

  const handleJoinCall = (enlace: string) => {
    window.open(enlace, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (hora: string) => {
    return hora.substring(0, 5)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 text-lg text-muted-foreground">Cargando llamadas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Llamadas en Vivo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Participa en sesiones en vivo, mentorías y webinars exclusivos
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCall(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Programar Llamada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCall ? 'Editar Llamada' : 'Programar Nueva Llamada'}
                </DialogTitle>
                <DialogDescription>
                  {editingCall ? 'Modifica los detalles de la llamada' : 'Crea una nueva llamada en vivo'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    defaultValue={editingCall?.titulo}
                    placeholder="Ej: Webinar de Trading Avanzado"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      defaultValue={editingCall?.fecha}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      name="hora"
                      type="time"
                      defaultValue={editingCall?.hora}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enlace">Enlace de la Llamada</Label>
                  <Input
                    id="enlace"
                    name="enlace"
                    type="url"
                    defaultValue={editingCall?.enlace}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCall ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de llamadas */}
      {calls.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
            <Video className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No hay llamadas programadas</h3>
            <p className="text-center text-sm text-muted-foreground">
              {isAdmin 
                ? 'Crea tu primera llamada en vivo usando el botón de arriba'
                : 'Las llamadas programadas aparecerán aquí'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Próximas sesiones</h2>
          
          {calls.map((call) => (
            <Card key={call.id} className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className="bg-primary text-primary-foreground">Programada</Badge>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(call)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(call.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <CardTitle>{call.titulo}</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="capitalize">{formatDate(call.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(call.hora)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleJoinCall(call.enlace)}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Unirse a la llamada
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
