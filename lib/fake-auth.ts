// Fake auth system — hardcoded admin, no Supabase required

const ADMIN_EMAIL = 'Hamzakerchaouii85@gmail.com'
const ADMIN_PASSWORD = '123456'

export interface FakeUser {
  id: string
  email: string
  role: 'admin'
  full_name: string
}

const ADMIN_USER: FakeUser = {
  id: 'admin-fixed-001',
  email: ADMIN_EMAIL,
  role: 'admin',
  full_name: 'Admin',
}

let _currentUser: FakeUser | null = null

// Check stored session on init (client only)
function getStoredSession(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('fake_admin_session') === 'true'
}

function setStoredSession(active: boolean) {
  if (typeof window === 'undefined') return
  if (active) {
    localStorage.setItem('fake_admin_session', 'true')
  } else {
    localStorage.removeItem('fake_admin_session')
  }
}

export function initSession(): FakeUser | null {
  if (getStoredSession()) {
    _currentUser = ADMIN_USER
  }
  return _currentUser
}

export async function fakeLogin(
  email: string,
  password: string
): Promise<{ user: FakeUser | null; error: string | null }> {
  await new Promise((r) => setTimeout(r, 300))

  if (
    email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  ) {
    _currentUser = ADMIN_USER
    setStoredSession(true)
    return { user: ADMIN_USER, error: null }
  }

  return { user: null, error: 'Usuario no encontrado o contrasena incorrecta.' }
}

export function fakeLogout() {
  _currentUser = null
  setStoredSession(false)
}

export function getCurrentUser(): FakeUser | null {
  if (!_currentUser && getStoredSession()) {
    _currentUser = ADMIN_USER
  }
  return _currentUser
}

export function isAdminUser(): boolean {
  return getCurrentUser()?.role === 'admin'
}
