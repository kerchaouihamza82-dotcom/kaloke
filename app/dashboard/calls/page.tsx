'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Video, Users, Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from 'sonner'

export default function CallsPage() {
  const { user, isAdmin } = useAuth()
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCall, setEditingCall] = useState<any>(null)

  useEffect(() => {
    loadCalls()
  }, [])

  const loadCalls = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('calls')
      .select('*')
      .order('date', { ascending: true })
    setCalls(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const callData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      duration_minutes: parseInt(formData.get('duration') as string),
      meeting_url: formData.get('meeting_url') as string,
      type: formData.get('type') as string,
      created_by: user?.id,
    }

    const supabase = createClient()

    if (editingCall) {
      const { error } = await supabase
        .from('calls')
        .update(callData)
        .eq('id', editingCall.id)
      if (error) {
        toast.error('Error al actualizar llamada')
        return
      }
      toast.success('Llamada actualizada')
    } else {
      const { error } = await supabase
        .from('calls')
        .insert(callData)
      if (error) {
        toast.error('Error al crear llamada')
        return
      }
      toast.success('Llamada creada')
    }

    setDialogOpen(false)
    setEditingCall(null)
    loadCalls()
  }

  const handleDelete = async (callId: string) => {
    if (!confirm('Eliminar esta llamada?')) return
    const supabase = createClient()
    await supabase.from('calls').delete().eq('id', callId)
    toast.success('Llamada eliminada')
    loadCalls()
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mentoring: 'Mentoria',
      webinar: 'Webinar',
      workshop: 'Taller',
    }
    return types[type] || type
  }

  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      mentoring: 'default',
      webinar: 'secondary',
      workshop: 'outline',
    }
    return variants[type] || 'secondary'
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    } catch {
      return dateStr
    }
  }

  const isUpcoming = (dateStr: string) => {
    const callDate = new Date(dateStr + 'T23:59:59')
    return callDate >= new Date()
  }

  const upcomingCalls = calls.filter((c) => isUpcoming(c.date))
  const pastCalls = calls.filter((c) => !isUpcoming(c.date))

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Llamadas en Vivo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Participa en sesiones en vivo, mentorias y webinars exclusivos
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingCall(null)
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCall(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Programar Llamada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCall ? 'Editar Llamada' : 'Programar Llamada'}</DialogTitle>
                <DialogDescription>Completa los datos de la sesion</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="call-title">Titulo</Label>
                  <Input id="call-title" name="title" defaultValue={editingCall?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-desc">Descripcion</Label>
                  <Textarea id="call-desc" name="description" rows={3} defaultValue={editingCall?.description} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="call-date">Fecha</Label>
                    <Input id="call-date" name="date" type="date" defaultValue={editingCall?.date} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="call-time">Hora</Label>
                    <Input id="call-time" name="time" type="time" defaultValue={editingCall?.time} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="call-duration">Duracion (min)</Label>
                    <Input id="call-duration" name="duration" type="number" defaultValue={editingCall?.duration_minutes || 60} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select name="type" defaultValue={editingCall?.type || 'webinar'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mentoring">Mentoria</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="workshop">Taller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-url">Enlace de la reunion (Google Meet, Zoom, etc.)</Label>
                  <Input id="call-url" name="meeting_url" type="url" placeholder="https://meet.google.com/..." defaultValue={editingCall?.meeting_url} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingCall ? 'Actualizar' : 'Crear'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        </div>
      ) : calls.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8 text-muted-foreground">
            <Video className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No hay llamadas programadas</p>
            {isAdmin && (
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Programar Primera Llamada
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Upcoming */}
          {upcomingCalls.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Proximas sesiones</h2>
              {upcomingCalls.map((call) => (
                <Card key={call.id} className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Badge variant={getTypeBadgeVariant(call.type)}>
                          {getTypeLabel(call.type)}
                        </Badge>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingCall(call)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
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
                      <CardTitle>{call.title}</CardTitle>
                      <CardDescription className="mt-2">{call.description}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="capitalize">{formatDate(call.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{call.time} ({call.duration_minutes} min)</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => window.open(call.meeting_url, '_blank')}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Unirse a la llamada
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Past */}
          {pastCalls.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Sesiones anteriores</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastCalls.map((call) => (
                  <Card key={call.id}>
                    <CardHeader>
                      <Badge className="w-fit" variant="secondary">
                        {getTypeLabel(call.type)}
                      </Badge>
                      <CardTitle className="mt-2">{call.title}</CardTitle>
                      <CardDescription>{formatDate(call.date)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Video className="mr-2 h-4 w-4" />
                        Ver grabacion
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
