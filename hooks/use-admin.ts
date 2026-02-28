'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Check role in profiles table (source of truth)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // Fallback: check user_metadata
      const metaAdmin = user.user_metadata?.is_admin === true ||
                        user.user_metadata?.role === 'admin'
      setIsAdmin(metaAdmin)

    } catch (error) {
      console.error('[v0] Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading }
}
