'use client'

import { useEffect, useState } from 'react'
import { initSession, getCurrentUser, type FakeUser } from '@/lib/fake-auth'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'admin'
  avatar_url: string | null
}

export function useAuth() {
  const [user, setUser] = useState<FakeUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = initSession()
    setUser(u)
    if (u) {
      setProfile({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        avatar_url: null,
      })
    }
    setLoading(false)
  }, [])

  const isAdmin = profile?.role === 'admin'

  return { user, profile, loading, isAdmin }
}
