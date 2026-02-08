'use client'

import React from "react"

import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tempSession, setTempSession] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch: solo acceder a localStorage después del mount
  useEffect(() => {
    setMounted(true)
    const session = localStorage.getItem('temp_admin_session')
    setTempSession(session)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user && !tempSession) {
      router.push('/login')
    }
  }, [user, loading, tempSession, router, mounted])

  // Mostrar loading mientras se monta el componente
  if (!mounted || (loading && !tempSession)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user && !tempSession) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col pl-64">
        <AppHeader />
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  )
}
