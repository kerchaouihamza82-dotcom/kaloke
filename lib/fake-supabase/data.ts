// ============================================================
// Fake Supabase Data Store
// In-memory data that simulates a Supabase database.
// Persisted to localStorage so data survives page reloads.
// ============================================================

function generateId(): string {
  return crypto.randomUUID()
}

// ---- Types ----
export interface FakeUser {
  id: string
  email: string
  user_metadata: Record<string, unknown>
  created_at: string
  app_metadata: Record<string, unknown>
  aud: string
  role: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string
  video_url: string
  video_type: 'youtube' | 'vimeo' | 'other'
  duration_minutes: number
  order_index: number
  content: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
  last_position_seconds: number
}

export interface CommunityMessage {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  content: string
  created_at: string
}

export interface Topic {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order_index: number
}

export interface Call {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration_minutes: number
  meeting_url: string
  type: 'mentoring' | 'webinar' | 'workshop'
  created_by: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  title: string
  content: string
  tag: string
  likes: number
  replies: number
  created_at: string
  updated_at: string
}

// ---- Seed IDs ----
const ADMIN_ID = '00000000-0000-0000-0000-000000000001'
const STUDENT_ID = '00000000-0000-0000-0000-000000000002'
const COURSE_1_ID = '10000000-0000-0000-0000-000000000001'
const COURSE_2_ID = '10000000-0000-0000-0000-000000000002'
const MODULE_1_ID = '20000000-0000-0000-0000-000000000001'
const MODULE_2_ID = '20000000-0000-0000-0000-000000000002'
const MODULE_3_ID = '20000000-0000-0000-0000-000000000003'
const LESSON_1_ID = '30000000-0000-0000-0000-000000000001'
const LESSON_2_ID = '30000000-0000-0000-0000-000000000002'
const LESSON_3_ID = '30000000-0000-0000-0000-000000000003'
const LESSON_4_ID = '30000000-0000-0000-0000-000000000004'

// ---- Default Seed Data ----
function createSeedData() {
  const now = new Date().toISOString()

  const users: FakeUser[] = [
    {
      id: ADMIN_ID,
      email: 'admin@digicash.academy',
      user_metadata: { full_name: 'Administrador DigiCash', role: 'admin' },
      app_metadata: { provider: 'email' },
      created_at: now,
      aud: 'authenticated',
      role: 'authenticated',
    },
    {
      id: STUDENT_ID,
      email: 'estudiante@digicash.academy',
      user_metadata: { full_name: 'Estudiante Demo', role: 'student' },
      app_metadata: { provider: 'email' },
      created_at: now,
      aud: 'authenticated',
      role: 'authenticated',
    },
  ]

  // Passwords stored plaintext in this simulation layer only
  const passwords: Record<string, string> = {
    'admin@digicash.academy': 'gmjhdigicash$',
    'estudiante@digicash.academy': 'student123',
  }

  const profiles: Profile[] = [
    {
      id: ADMIN_ID,
      email: 'admin@digicash.academy',
      full_name: 'Administrador DigiCash',
      role: 'admin',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: STUDENT_ID,
      email: 'estudiante@digicash.academy',
      full_name: 'Estudiante Demo',
      role: 'student',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
  ]

  const courses: Course[] = [
    {
      id: COURSE_1_ID,
      title: 'Marca Personal: Crea tu Identidad Digital',
      description: 'Aprende a construir una marca personal poderosa que conecte con tu audiencia y genere oportunidades de negocio.',
      level: 'beginner',
      duration_hours: 8,
      created_at: now,
      updated_at: now,
    },
    {
      id: COURSE_2_ID,
      title: 'Mentalidad de Exito y Sublimacion',
      description: 'Desarrolla la mentalidad ganadora necesaria para triunfar en el mundo digital. Estrategias probadas de alto rendimiento.',
      level: 'intermediate',
      duration_hours: 12,
      created_at: now,
      updated_at: now,
    },
  ]

  const modules: Module[] = [
    {
      id: MODULE_1_ID,
      course_id: COURSE_1_ID,
      title: 'Fundamentos de Marca Personal',
      description: 'Conceptos esenciales para construir tu marca personal desde cero',
      order_index: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: MODULE_2_ID,
      course_id: COURSE_1_ID,
      title: 'Creacion de Contenido Viral',
      description: 'Tecnicas para crear contenido que conecte y se viralice',
      order_index: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: MODULE_3_ID,
      course_id: COURSE_2_ID,
      title: 'Reprogramacion Mental',
      description: 'Aprende a reprogramar tu mente para el exito en los negocios digitales',
      order_index: 1,
      created_at: now,
      updated_at: now,
    },
  ]

  const lessons: Lesson[] = [
    {
      id: LESSON_1_ID,
      module_id: MODULE_1_ID,
      title: 'Que es la marca personal y por que importa',
      description: 'Introduccion al concepto de marca personal y su impacto en tu carrera profesional',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_type: 'youtube',
      duration_minutes: 15,
      order_index: 1,
      content: 'En esta leccion aprenderemos los conceptos fundamentales de la marca personal. Tu marca personal es la percepcion que otros tienen de ti basada en tu presencia digital.',
      created_at: now,
      updated_at: now,
    },
    {
      id: LESSON_2_ID,
      module_id: MODULE_1_ID,
      title: 'Define tu propuesta de valor unica',
      description: 'Como descubrir y comunicar tu diferenciador clave',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_type: 'youtube',
      duration_minutes: 20,
      order_index: 2,
      content: 'Tu propuesta de valor unica (PVU) es lo que te diferencia del resto. Es la razon por la que tu audiencia te elige a ti sobre la competencia.',
      created_at: now,
      updated_at: now,
    },
    {
      id: LESSON_3_ID,
      module_id: MODULE_2_ID,
      title: 'Algoritmos de redes sociales',
      description: 'Entiende como funcionan los algoritmos para maximizar tu alcance',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_type: 'youtube',
      duration_minutes: 25,
      order_index: 1,
      content: 'Los algoritmos de las redes sociales priorizan contenido que genera engagement. Aprende a crear publicaciones que el algoritmo amplifique.',
      created_at: now,
      updated_at: now,
    },
    {
      id: LESSON_4_ID,
      module_id: MODULE_3_ID,
      title: 'Los pilares de una mentalidad ganadora',
      description: 'Fundamentos psicologicos del exito en los negocios',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_type: 'youtube',
      duration_minutes: 18,
      order_index: 1,
      content: 'Una mentalidad ganadora se construye sobre tres pilares: disciplina, vision y resiliencia. En esta leccion profundizaremos en cada uno.',
      created_at: now,
      updated_at: now,
    },
  ]

  const enrollments: Enrollment[] = [
    {
      id: generateId(),
      user_id: STUDENT_ID,
      course_id: COURSE_1_ID,
      enrolled_at: now,
    },
  ]

  const lesson_progress: LessonProgress[] = [
    {
      id: generateId(),
      user_id: STUDENT_ID,
      lesson_id: LESSON_1_ID,
      completed: true,
      completed_at: now,
      last_position_seconds: 900,
    },
    {
      id: generateId(),
      user_id: STUDENT_ID,
      lesson_id: LESSON_2_ID,
      completed: false,
      completed_at: null,
      last_position_seconds: 300,
    },
  ]

  const community_messages: CommunityMessage[] = [
    {
      id: generateId(),
      user_id: ADMIN_ID,
      user_name: 'Administrador DigiCash',
      user_avatar: null,
      content: 'Bienvenidos a la comunidad de DigiCash Academy. Este es el espacio para compartir ideas, resolver dudas y crecer juntos.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: generateId(),
      user_id: STUDENT_ID,
      user_name: 'Estudiante Demo',
      user_avatar: null,
      content: 'Hola a todos! Acabo de empezar el curso de Marca Personal y ya estoy aprendiendo un monton. Muy recomendado!',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: generateId(),
      user_id: ADMIN_ID,
      user_name: 'Administrador DigiCash',
      user_avatar: null,
      content: 'Recuerden que manana a las 3 PM tenemos la sesion de mentoria en vivo. No se la pierdan!',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ]

  const topics: Topic[] = [
    {
      id: generateId(),
      name: 'Marca Personal',
      slug: 'marca-personal',
      description: 'Todo sobre construccion de marca personal',
      icon: 'star',
      color: 'bg-primary/10 text-primary',
      order_index: 1,
    },
    {
      id: generateId(),
      name: 'Mentalidad',
      slug: 'mentalidad',
      description: 'Desarrollo de mentalidad de exito',
      icon: 'brain',
      color: 'bg-primary/10 text-primary',
      order_index: 2,
    },
  ]

  const calls: Call[] = [
    {
      id: generateId(),
      title: 'Sesion de Mentoria Personal',
      description: 'Reunion individual para resolver dudas y revisar tu estrategia de marca personal y contenido viral.',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '15:00',
      duration_minutes: 60,
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      type: 'mentoring',
      created_by: ADMIN_ID,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      title: 'Estrategias de Contenido Viral 2025',
      description: 'Webinar grupal sobre las mejores estrategias y tendencias de contenido para este ano.',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '18:00',
      duration_minutes: 120,
      meeting_url: 'https://meet.google.com/xyz-uvwx-rst',
      type: 'webinar',
      created_by: ADMIN_ID,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      title: 'Workshop: Crea tu Plan de Marca Personal',
      description: 'Taller practico donde aprenderemos a crear un plan de marca personal paso a paso.',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      time: '16:00',
      duration_minutes: 120,
      meeting_url: 'https://meet.google.com/klm-nopq-stu',
      type: 'workshop',
      created_by: ADMIN_ID,
      created_at: now,
      updated_at: now,
    },
  ]

  const posts: Post[] = [
    {
      id: generateId(),
      user_id: STUDENT_ID,
      user_name: 'Estudiante Demo',
      user_avatar: null,
      title: 'Cual es la mejor estrategia para viralizar contenido?',
      content: 'Estoy comenzando a crear contenido y me gustaria saber que estrategias recomiendan para alguien que esta empezando. Tengo dudas sobre si usar reels, carruseles o hilos.',
      tag: 'Marca Personal',
      likes: 24,
      replies: 12,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: generateId(),
      user_id: ADMIN_ID,
      user_name: 'Administrador DigiCash',
      user_avatar: null,
      title: 'Guia completa sobre storytelling para redes',
      content: 'He preparado una guia detallada sobre como usar storytelling en tus publicaciones. Incluye ejemplos practicos, plantillas y consejos para conectar con tu audiencia.',
      tag: 'Contenido',
      likes: 45,
      replies: 28,
      created_at: new Date(Date.now() - 18000000).toISOString(),
      updated_at: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: generateId(),
      user_id: STUDENT_ID,
      user_name: 'Estudiante Demo',
      user_avatar: null,
      title: 'Mi experiencia con el curso de Mentalidad de Exito',
      content: 'Comparto mi experiencia tras completar el primer modulo. Los conceptos de reprogramacion mental son muy potentes y ya estoy viendo cambios en mi forma de pensar.',
      tag: 'Mentalidad',
      likes: 67,
      replies: 34,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  return {
    users,
    passwords,
    profiles,
    courses,
    modules,
    lessons,
    enrollments,
    lesson_progress,
    community_messages,
    topics,
    calls,
    posts,
  }
}

// ---- Persistence Key ----
const STORAGE_KEY = 'fake_supabase_db'
const AUTH_KEY = 'fake_supabase_auth'

export type DataStore = ReturnType<typeof createSeedData>

// ---- Get / Save ----
let _cache: DataStore | null = null

export function getStore(): DataStore {
  if (_cache) return _cache

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        _cache = JSON.parse(raw)
        return _cache!
      }
    } catch {
      // Corrupt data, reset
    }
  }

  _cache = createSeedData()
  saveStore()
  return _cache
}

export function saveStore() {
  if (!_cache) return
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_cache))
    } catch {
      // Storage full, etc.
    }
  }
}

export function resetStore() {
  _cache = createSeedData()
  saveStore()
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
  }
}

// ---- Auth session persistence ----
export function getStoredSession(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_KEY)
}

export function setStoredSession(userId: string | null) {
  if (typeof window === 'undefined') return
  if (userId) {
    localStorage.setItem(AUTH_KEY, userId)
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}
