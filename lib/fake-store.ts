// In-memory fake data store for courses, modules and lessons
// No Supabase needed — all CRUD operations are simulated async

export interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  created_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string
  order_index: number
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string
  video_url: string
  order_index: number
  created_at: string
}

// ---------- helpers ----------
let _courseCounter = 0
let _moduleCounter = 0
let _lessonCounter = 0

function uid(prefix: string, counter: number) {
  return `${prefix}_${Date.now()}_${counter}`
}

// ---------- data ----------
let courses: Course[] = []
let modules: Module[] = []
let lessons: Lesson[] = []

// small simulated latency
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms))

// ========== COURSES ==========

export async function getCourses(): Promise<Course[]> {
  await delay()
  return [...courses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getCourse(id: string): Promise<Course | null> {
  await delay()
  return courses.find((c) => c.id === id) || null
}

export async function createCourse(
  data: Pick<Course, 'title' | 'description' | 'level' | 'duration_hours'>
): Promise<Course> {
  await delay()
  _courseCounter++
  const course: Course = {
    ...data,
    id: uid('course', _courseCounter),
    created_at: new Date().toISOString(),
  }
  courses.push(course)
  return course
}

export async function updateCourse(
  id: string,
  data: Partial<Pick<Course, 'title' | 'description' | 'level' | 'duration_hours'>>
): Promise<Course | null> {
  await delay()
  const idx = courses.findIndex((c) => c.id === id)
  if (idx === -1) return null
  courses[idx] = { ...courses[idx], ...data }
  return courses[idx]
}

export async function deleteCourse(id: string): Promise<boolean> {
  await delay()
  const len = courses.length
  // cascade delete modules and lessons
  const moduleIds = modules.filter((m) => m.course_id === id).map((m) => m.id)
  lessons = lessons.filter((l) => !moduleIds.includes(l.module_id))
  modules = modules.filter((m) => m.course_id !== id)
  courses = courses.filter((c) => c.id !== id)
  return courses.length < len
}

// count helpers
export async function getModulesCountForCourse(courseId: string): Promise<number> {
  await delay(50)
  return modules.filter((m) => m.course_id === courseId).length
}

// ========== MODULES ==========

export async function getModules(courseId: string): Promise<Module[]> {
  await delay()
  return [...modules]
    .filter((m) => m.course_id === courseId)
    .sort((a, b) => a.order_index - b.order_index)
}

export async function getModule(id: string): Promise<Module | null> {
  await delay()
  return modules.find((m) => m.id === id) || null
}

export async function createModule(
  data: Pick<Module, 'course_id' | 'title' | 'description' | 'order_index'>
): Promise<Module> {
  await delay()
  _moduleCounter++
  const mod: Module = {
    ...data,
    id: uid('module', _moduleCounter),
    created_at: new Date().toISOString(),
  }
  modules.push(mod)
  return mod
}

export async function updateModule(
  id: string,
  data: Partial<Pick<Module, 'title' | 'description' | 'order_index'>>
): Promise<Module | null> {
  await delay()
  const idx = modules.findIndex((m) => m.id === id)
  if (idx === -1) return null
  modules[idx] = { ...modules[idx], ...data }
  return modules[idx]
}

export async function deleteModule(id: string): Promise<boolean> {
  await delay()
  const len = modules.length
  // cascade delete lessons
  lessons = lessons.filter((l) => l.module_id !== id)
  modules = modules.filter((m) => m.id !== id)
  return modules.length < len
}

export async function getLessonsCountForModule(moduleId: string): Promise<number> {
  await delay(50)
  return lessons.filter((l) => l.module_id === moduleId).length
}

// ========== LESSONS ==========

export async function getLessons(moduleId: string): Promise<Lesson[]> {
  await delay()
  return [...lessons]
    .filter((l) => l.module_id === moduleId)
    .sort((a, b) => a.order_index - b.order_index)
}

export async function getLesson(id: string): Promise<Lesson | null> {
  await delay()
  return lessons.find((l) => l.id === id) || null
}

export async function createLesson(
  data: Pick<Lesson, 'module_id' | 'title' | 'description' | 'video_url' | 'order_index'>
): Promise<Lesson> {
  await delay()
  _lessonCounter++
  const lesson: Lesson = {
    ...data,
    id: uid('lesson', _lessonCounter),
    created_at: new Date().toISOString(),
  }
  lessons.push(lesson)
  return lesson
}

export async function updateLesson(
  id: string,
  data: Partial<Pick<Lesson, 'title' | 'description' | 'video_url' | 'order_index'>>
): Promise<Lesson | null> {
  await delay()
  const idx = lessons.findIndex((l) => l.id === id)
  if (idx === -1) return null
  lessons[idx] = { ...lessons[idx], ...data }
  return lessons[idx]
}

export async function deleteLesson(id: string): Promise<boolean> {
  await delay()
  const len = lessons.length
  lessons = lessons.filter((l) => l.id !== id)
  return lessons.length < len
}

// ========== STATS ==========

export async function getStats() {
  await delay()
  return {
    courses: courses.length,
    modules: modules.length,
    lessons: lessons.length,
    students: 0,
  }
}
