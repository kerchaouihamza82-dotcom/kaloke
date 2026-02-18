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

      // Check if user is admin from user_metadata
      const userIsAdmin = user.user_metadata?.is_admin === true || 
                         user.user_metadata?.role === 'admin'
      
      // Also check by email as fallback
      const adminEmails = ['admin@digicash.academy', 'hamzakerchaoui11@gmail.com']
      const emailIsAdmin = adminEmails.includes(user.email || '')
      
      setIsAdmin(userIsAdmin || emailIsAdmin)
      
    } catch (error) {
      console.error('[v0] Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading }
}
