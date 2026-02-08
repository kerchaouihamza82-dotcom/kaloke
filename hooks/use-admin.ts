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

      // Check if user is admin from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('[v0] Error fetching profile:', error)
        // Fallback to email check
        const adminEmails = ['admin@digicash.academy', 'hamzakerchaoui11@gmail.com']
        setIsAdmin(adminEmails.includes(user.email || ''))
      } else {
        setIsAdmin(profile?.role === 'admin')
      }
      
    } catch (error) {
      console.error('[v0] Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading }
}
