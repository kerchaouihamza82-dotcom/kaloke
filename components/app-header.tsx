"use client"

import { Bell, Search, Menu, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { EditModeToggle } from "@/components/edit-mode-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsPopover } from "@/components/notifications-popover"
import Link from "next/link"
import { useEffect, useState } from "react"

export function AppHeader() {
  const { user, profile, isAdmin } = useAuth()
  const router = useRouter()
  const [tempSession, setTempSession] = useState<string | null>(null)

  // Evitar hydration mismatch
  useEffect(() => {
    setTempSession(localStorage.getItem('temp_admin_session'))
  }, [])

  const displayEmail = user?.email || (tempSession ? 'admin@digicash.academy' : '')
  const displayName = profile?.full_name || (tempSession ? 'Administrador' : 'Usuario')
  const displayInitial = displayName?.[0]?.toUpperCase() || 'A'
  const showAdminBadge = isAdmin || tempSession

  async function handleSignOut() {
    // BYPASS TEMPORAL: Limpiar sesión temporal
    if (tempSession) {
      localStorage.removeItem('temp_admin_session')
      router.push('/login')
      router.refresh()
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed left-64 right-0 top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cursos, lecciones..."
              className="w-full pl-9"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Edit Mode Toggle */}
          <EditModeToggle />
          
          {/* Admin Badge */}
          {showAdminBadge && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}

          {/* Notifications */}
          <NotificationsPopover />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Mi perfil</Link>
              </DropdownMenuItem>
              {showAdminBadge && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Panel de administración</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
