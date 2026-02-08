// Mock Supabase Client - for demo without real backend
export function createMockClient() {
  const STORAGE_KEY = 'digicash_mock_auth'
  const USERS_KEY = 'digicash_mock_users'

  // Initialize mock users in localStorage
  if (typeof window !== 'undefined') {
    const existingUsers = localStorage.getItem(USERS_KEY)
    if (!existingUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify([
        { 
          id: 'admin-001', 
          email: 'admin@digicash.com', 
          password: 'admin123',
          profile: {
            id: 'admin-001',
            email: 'admin@digicash.com',
            full_name: 'Administrador DigiCash',
            role: 'admin',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        { 
          id: 'student-001', 
          email: 'estudiante@demo.com', 
          password: 'demo123',
          profile: {
            id: 'student-001',
            email: 'estudiante@demo.com',
            full_name: 'Estudiante Demo',
            role: 'student',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]))
    }
  }

  const getStoredSession = () => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }

  const setStoredSession = (session: any) => {
    if (typeof window === 'undefined') return
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const getUsers = () => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  const addUser = (user: any) => {
    if (typeof window === 'undefined') return
    const users = getUsers()
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  // Auth methods
  const auth = {
    getUser: async () => {
      const session = getStoredSession()
      return { data: { user: session?.user || null }, error: null }
    },
    
    signInWithPassword: async ({ email, password }: any) => {
      const users = getUsers()
      const user = users.find((u: any) => u.email === email && u.password === password)
      
      if (user) {
        const session = {
          user: { id: user.id, email: user.email, profile: user.profile },
          access_token: 'mock_token'
        }
        setStoredSession(session)
        return { data: { user: session.user, session }, error: null }
      }
      
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
    },
    
    signUp: async ({ email, password, options }: any) => {
      const users = getUsers()
      const existingUser = users.find((u: any) => u.email === email)
      
      if (existingUser) {
        return { data: { user: null, session: null }, error: { message: 'User already exists' } }
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        profile: {
          id: `user-${Date.now()}`,
          email,
          full_name: options?.data?.full_name || null,
          role: 'student',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      addUser(newUser)
      
      const session = {
        user: { id: newUser.id, email: newUser.email, profile: newUser.profile },
        access_token: 'mock_token'
      }
      setStoredSession(session)
      
      return { data: { user: session.user, session }, error: null }
    },
    
    signOut: async () => {
      setStoredSession(null)
      return { error: null }
    },
    
    onAuthStateChange: (callback: Function) => {
      // Simple implementation that doesn't do much
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
  }

  // Database methods
  const from = (table: string) => {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const session = getStoredSession()
            if (!session) return { data: null, error: { message: 'Not authenticated' } }
            
            if (table === 'profiles') {
              return { data: session.user.profile, error: null }
            }
            
            return { data: null, error: null }
          },
          then: async (callback: Function) => {
            const session = getStoredSession()
            if (!session) return callback({ data: null, error: { message: 'Not authenticated' } })
            
            if (table === 'profiles') {
              return callback({ data: session.user.profile, error: null })
            }
            
            return callback({ data: null, error: null })
          }
        }),
        then: async (callback: Function) => {
          const session = getStoredSession()
          if (!session) return callback({ data: [], error: { message: 'Not authenticated' } })
          
          // Return mock data for different tables
          if (table === 'courses') {
            return callback({ data: [], error: null })
          }
          
          return callback({ data: [], error: null })
        }
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => async () => ({ error: null })
      })
    }
  }

  return {
    auth,
    from
  }
}
