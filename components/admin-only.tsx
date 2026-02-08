'use client'

import React from "react"

import { useUser } from '@/hooks/use-user'

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin, loading } = useUser()

  if (loading) return null
  if (!isAdmin) return <>{fallback}</>

  return <>{children}</>
}
