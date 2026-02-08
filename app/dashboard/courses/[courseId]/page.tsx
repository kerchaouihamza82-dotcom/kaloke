'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Play, CheckCircle2, Circle, FolderOpen, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import Link from 'next/link'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const { user, isAdmin } = useAuth()

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openModules, setOpenModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    const supabase = createClient()

    const [courseRes, modulesRes, lessonsRes, progressRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      supabase.from('lessons').select('*').order('order_index', { ascending: true }),
      user ? supabase.from('lesson_progress').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] }),
    ])

    setCourse(courseRes.data)
    const mods = modulesRes.data || []
    setModules(mods)

    // Filter lessons to only those belonging to modules in this course
    const moduleIds = mods.map((m: any) => m.id)
    const filteredLessons = (lessonsRes.data || []).filter((l: any) => moduleIds.includes(l.module_id))
    setLessons(filteredLessons)
    setProgress(progressRes.data || [])

    // Open first module by default
    if (mods.length > 0) {
      setOpenModules(new Set([mods[0].id]))
    }

    setLoading(false)
  }

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p: any) => p.lesson_id === lessonId && p.completed)
  }

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <p className="text-lg text-muted-foreground">Curso no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    )
  }

  const totalLessons = lessons.length
  const completedLessons = lessons.filter((l) => isLessonCompleted(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="space-y-6 p-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Cursos
      </Button>

      {/* Course Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            {course.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground">{course.description}</p>
          <div className="flex items-center gap-4 pt-2">
            <Badge>{course.level === 'beginner' ? 'Principiante' : course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}</Badge>
            {course.duration_hours && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}h</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{totalLessons} lecciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso del curso</span>
              <span className="font-medium text-foreground">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {completedLessons}/{totalLessons}
          </div>
        </CardContent>
      </Card>

      {/* Modules & Lessons Tree */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-muted-foreground">
            <FolderOpen className="mb-2 h-10 w-10" />
            <p>Este curso aun no tiene modulos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const modLessons = lessons.filter((l) => l.module_id === mod.id)
            const modCompleted = modLessons.filter((l) => isLessonCompleted(l.id)).length
            const isOpen = openModules.has(mod.id)

            return (
              <Card key={mod.id}>
                <Collapsible open={isOpen} onOpenChange={() => toggleModule(mod.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <CardTitle className="text-base">{mod.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {modLessons.length} lecciones | {modCompleted} completadas
                            </CardDescription>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-1 pt-0">
                      {modLessons.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Este modulo aun no tiene lecciones
                        </p>
                      ) : (
                        modLessons.map((lesson, lessonIdx) => {
                          const completed = isLessonCompleted(lesson.id)
                          return (
                            <Link
                              key={lesson.id}
                              href={`/dashboard/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}`}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                            >
                              {completed ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                              ) : (
                                <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {lessonIdx + 1}. {lesson.title}
                                </p>
                                {lesson.duration_minutes && (
                                  <p className="text-xs text-muted-foreground">{lesson.duration_minutes} min</p>
                                )}
                              </div>
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          )
                        })
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
