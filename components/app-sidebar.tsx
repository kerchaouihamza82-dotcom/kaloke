"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Users, Video, User, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdmin } from "@/hooks/use-admin"
import { getCurrentUser } from "@/lib/fake-auth"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cursos",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Comunidad",
    href: "/dashboard/community",
    icon: Users,
  },
  {
    title: "Llamadas",
    href: "/dashboard/calls",
    icon: Video,
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: User,
  },
]

const adminNavItem = {
  title: "Administracion",
  href: "/admin",
  icon: Shield,
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAdmin()
  const user = getCurrentUser()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-semibold text-foreground">DigiCash Academy</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
          
          {/* Admin Link */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-border" />
              <Link
                href={adminNavItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(adminNavItem.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <adminNavItem.icon className="h-5 w-5" />
                {adminNavItem.title}
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-medium">{user?.full_name?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{user?.full_name || 'Usuario'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || 'usuario@email.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
