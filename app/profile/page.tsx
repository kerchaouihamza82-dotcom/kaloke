"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Camera, User as UserIcon, Lock, Bell, Award, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { upload } from '@vercel/blob/client'
import { NotificationsList } from "@/components/notifications-list"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('[v0] Error getting user:', authError)
        router.push('/login')
        return
      }

      // Load profile from user_profiles table
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        phone: authUser.user_metadata?.phone || null,
        bio: profile?.bio || null
      }

      setUser(userProfile)
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email,
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
        avatar_url: userProfile.avatar_url || ''
      })
    } catch (error) {
      console.error('[v0] Error loading profile:', error)
      toast.error('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }

    setUploadingAvatar(true)
    console.log('[v0] Starting upload for:', file.name)

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      console.log('[v0] Upload successful, URL:', newBlob.url)

      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) throw new Error('No user found')
      console.log('[v0] User ID:', currentUser.id)

      // Update user_profiles table with new avatar
      console.log('[v0] Updating user_profiles with avatar:', newBlob.url)
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: currentUser.id,
          avatar_url: newBlob.url
        })

      if (error) {
        console.error('[v0] Supabase error:', error)
        throw error
      }
      console.log('[v0] Profile updated successfully')

      setUser(prev => prev ? { ...prev, avatar_url: newBlob.url } : null)
      setFormData(prev => ({ ...prev, avatar_url: newBlob.url }))
      toast.success('Foto de perfil actualizada')
    } catch (error) {
      console.error('[v0] Error uploading avatar:', error)
      toast.error('Error al subir la imagen: ' + (error as Error).message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Update email in auth if changed
      if (formData.email !== user.email) {
        const { error } = await supabase.auth.updateUser({
          email: formData.email
        })
        if (error) throw error
      }

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url
        })

      if (profileError) throw profileError

      toast.success('Perfil actualizado exitosamente')
      loadUserProfile()
    } catch (error: any) {
      console.error('[v0] Error updating profile:', error)
      toast.error(error.message || 'Error al actualizar el perfil')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Contraseña actualizada exitosamente')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      console.error('[v0] Error updating password:', error)
      toast.error(error.message || 'Error al actualizar la contraseña')
    } finally {
      setUpdating(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8 p-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
          Mi Perfil
        </h1>
        <p className="mt-2 text-muted-foreground">
          Administra tu información personal y preferencias de la cuenta
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'Usuario'} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                variant="secondary"
                disabled={uploadingAvatar}
                onClick={() => document.getElementById('avatar-upload')?.click()}
                type="button"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground">{user.full_name || 'Sin nombre'}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                <Badge variant="secondary">Estudiante</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información de perfil y detalles personales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+34 123 456 789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => loadUserProfile()}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Mantén tu cuenta segura actualizando tu contraseña regularmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Repite la contraseña"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Contraseña'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Recientes
              </CardTitle>
              <CardDescription>
                Gestiona y revisa tus notificaciones más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsList />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibes notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nuevos Cursos</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones cuando se publiquen nuevos cursos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones de Cursos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre actualizaciones en tus cursos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Llamadas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recordatorios antes de sesiones en vivo programadas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">Guardar Preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
