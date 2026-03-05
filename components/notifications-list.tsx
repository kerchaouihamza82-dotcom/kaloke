'use client'

import { useState, useEffect } from 'react'
import { Check, Trash2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('profile-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error('[v0] Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error
      toast.success('Notificación marcada como leída')
      await fetchNotifications()
    } catch (error) {
      console.error('[v0] Error marking notification as read:', error)
      toast.error('Error al marcar la notificación')
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      toast.success('Todas las notificaciones marcadas como leídas')
      await fetchNotifications()
    } catch (error) {
      console.error('[v0] Error marking all as read:', error)
      toast.error('Error al marcar las notificaciones')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Notificación eliminada')
      await fetchNotifications()
    } catch (error) {
      console.error('[v0] Error deleting notification:', error)
      toast.error('Error al eliminar la notificación')
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="default" className="bg-green-500">Éxito</Badge>
      case 'warning': return <Badge variant="default" className="bg-yellow-500">Advertencia</Badge>
      case 'error': return <Badge variant="destructive">Error</Badge>
      default: return <Badge variant="secondary">Info</Badge>
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Cargando notificaciones...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Historial de Notificaciones</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} sin leer</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No tienes notificaciones</h3>
          <p className="text-sm text-muted-foreground">
            Las nuevas notificaciones aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group flex gap-4 rounded-lg border p-4 transition-colors ${
                !notification.read ? 'bg-accent/50' : ''
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{notification.title}</h4>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    {getTypeBadge(notification.type)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Marcar como leída
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
