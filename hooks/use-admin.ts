'use client'

import { useState, useEffect } from 'react'
import { initSession, isAdminUser } from '@/lib/fake-auth'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initSession()
    setIsAdmin(isAdminUser())
    setLoading(false)
  }, [])

  return { isAdmin, loading }
}
