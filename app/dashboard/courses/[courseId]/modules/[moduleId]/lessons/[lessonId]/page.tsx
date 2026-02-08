'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { getCourse, getModule, getLesson, getLessons, type Lesson } from '@/lib/fake-store'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [moduleName, setModuleName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [c, m, l, ls] = await Promise.all([
          getCourse(params.courseId as string),
          getModule(params.moduleId as string),
          getLesson(params.lessonId as string),
          getLessons(params.moduleId as string),
        ])
        setCourseName(c?.title || '')
        setModuleName(m?.title || '')
        setLesson(l)
        setAllLessons(ls)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.lessonId, params.courseId, params.moduleId])

  const currentIndex = allLessons.findIndex((l) => l.id === lesson?.id)

  const goToNextLesson = () => {
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1]
      router.push(`/dashboard/courses/${params.courseId}/modules/${params.moduleId}/lessons/${next.id}`)
    }
  }

  const goToPreviousLesson = () => {
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1]
      router.push(`/dashboard/courses/${params.courseId}/modules/${params.moduleId}/lessons/${prev.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Cargando leccion...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Leccion no encontrada</p>
            <Link href="/dashboard/courses">
              <Button className="mt-4">Volver a Cursos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/courses" className="hover:text-foreground">Cursos</Link>
          <span>/</span>
          <span>{courseName}</span>
          <span>/</span>
          <span className="text-foreground">{lesson.title}</span>
        </div>

        {/* Video link */}
        {lesson.video_url && (
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-lg font-medium text-primary hover:underline"
              >
                Abrir video externo <ExternalLink className="h-5 w-5" />
              </a>
            </CardContent>
          </Card>
        )}

        {/* Lesson Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                {lesson.description && (
                  <CardDescription className="text-base">{lesson.description}</CardDescription>
                )}
              </div>
              <Button
                variant={completed ? "default" : "outline"}
                size="lg"
                onClick={() => setCompleted(!completed)}
                className="gap-2"
              >
                <CheckCircle2 className={`h-5 w-5 ${completed ? 'fill-current' : ''}`} />
                {completed ? 'Completada' : 'Marcar como completada'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousLesson}
            disabled={currentIndex <= 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Leccion Anterior
          </Button>
          <Button
            variant="outline"
            onClick={goToNextLesson}
            disabled={currentIndex >= allLessons.length - 1}
            className="gap-2 bg-transparent"
          >
            Siguiente Leccion
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Other Lessons in Module */}
        {allLessons.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Otras lecciones en este modulo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allLessons.map((l, index) => (
                  <Link
                    key={l.id}
                    href={`/dashboard/courses/${params.courseId}/modules/${params.moduleId}/lessons/${l.id}`}
                    className={`block rounded-lg border p-4 transition-colors hover:bg-muted ${
                      l.id === lesson.id ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <p className="font-medium text-foreground">{l.title}</p>
                      </div>
                      {l.id === lesson.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
