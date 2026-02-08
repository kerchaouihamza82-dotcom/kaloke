'use client'

import { useEffect, useState } from 'react'
import { initSession, getCurrentUser, type FakeUser } from '@/lib/fake-auth'

export function useUser() {
  const [user, setUser] = useState<FakeUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const u = initSession()
    setUser(u)
    setIsAdmin(u?.role === 'admin')
    setLoading(false)
  }, [])

  return { user, loading, isAdmin }
}
