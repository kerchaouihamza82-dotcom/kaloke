'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setUser({ ...user, profile: profile || undefined } as User)
        setIsAdmin(profile?.role === 'admin')
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser()
      } else {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, isAdmin }
}
