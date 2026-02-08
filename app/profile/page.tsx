'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Camera, User, Lock, Moon, Sun, ArrowLeft, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "next-themes"
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isAdmin, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [stats, setStats] = useState({ courses: 0, completed: 0, hours: 0 })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
    }
  }, [profile])

  useEffect(() => {
    if (user) loadStats()
  }, [user])

  const loadStats = async () => {
    const supabase = createClient()
    const { count: enrollments } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user?.id)

    const { count: completedLessons } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('completed', true)

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('last_position_seconds')
      .eq('user_id', user?.id)

    const totalSeconds = progress?.reduce((acc: number, p: any) => acc + (p.last_position_seconds || 0), 0) || 0

    setStats({
      courses: enrollments || 0,
      completed: completedLessons || 0,
      hours: Math.round((totalSeconds / 3600) * 10) / 10,
    })
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al guardar perfil')
    } else {
      toast.success('Perfil actualizado')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  const displayName = profile?.full_name || 'Usuario'
  const displayInitial = displayName[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-8 p-8">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Mi Perfil
          </h1>
          <p className="mt-2 text-muted-foreground">
            Administra tu informacion personal y preferencias
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? 'Administrador' : 'Estudiante'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.courses}</p>
                  <p className="text-xs text-muted-foreground">Cursos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.hours}h</p>
                  <p className="text-xs text-muted-foreground">Vistas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informacion Personal
            </CardTitle>
            <CardDescription>Actualiza tu informacion de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail">Email</Label>
              <Input id="profileEmail" value={user.email} disabled />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Apariencia
            </CardTitle>
            <CardDescription>Personaliza el aspecto de la aplicacion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Alterna entre tema claro y oscuro
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>Mantiene tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contrasena</Label>
              <Input id="newPassword" type="password" placeholder="********" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar Contrasena</Label>
              <Input id="confirmNewPassword" type="password" placeholder="********" />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="bg-transparent">
                Actualizar Contrasena
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Card className="border-destructive/30">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-medium text-foreground">Cerrar Sesion</p>
              <p className="text-sm text-muted-foreground">Saldras de tu cuenta actual</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesion
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
