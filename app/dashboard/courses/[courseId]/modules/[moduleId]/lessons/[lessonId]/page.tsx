'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, CheckCircle2, Play } from 'lucide-react'
import Link from 'next/link'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLessonData()
  }, [params.lessonId])

  const loadLessonData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*, modules(*, courses(*))')
        .eq('id', params.lessonId as string)
        .single()

      if (lessonError || !lessonData) {
        console.error('[v0] Error loading lesson:', lessonError)
        return
      }

      setLesson(lessonData)
      setModule(lessonData.modules)
      setCourse(lessonData.modules?.courses)

      // Load all lessons in this module
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', params.moduleId as string)
        .order('order_index', { ascending: true })

      setAllLessons(lessonsData || [])

      // Load or create progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId as string)
        .single()

      if (progressData) {
        setProgress(progressData)
      } else {
        // Create initial progress
        const { data: newProgress } = await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: params.lessonId as string,
            completed: false,
            last_position_seconds: 0
          })
          .select()
          .single()
        
        setProgress(newProgress)
      }

      console.log('[v0] Lesson data loaded:', { lesson: lessonData, progress: progressData })
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !lesson) return

      const newCompleted = !progress?.completed

      const { error } = await supabase
        .from('lesson_progress')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)

      if (!error) {
        setProgress({ ...progress, completed: newCompleted })
        console.log('[v0] Lesson marked as', newCompleted ? 'completed' : 'incomplete')
      }
    } catch (error) {
      console.error('[v0] Error updating progress:', error)
    }
  }

  const updateWatchTime = async (seconds: number) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !lesson) return

      await supabase
        .from('lesson_progress')
        .update({
          last_position_seconds: Math.floor(seconds)
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)

      console.log('[v0] Watch time updated:', Math.floor(seconds), 'seconds')
    } catch (error) {
      console.error('[v0] Error updating watch time:', error)
    }
  }

  const getVideoEmbedUrl = (url: string, type: string) => {
    if (type === 'youtube') {
      // Extract video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      const videoId = match && match[2].length === 11 ? match[2] : null
      return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1` : url
    } else if (type === 'vimeo') {
      // Extract Vimeo ID
      const regExp = /vimeo.com\/(\d+)/
      const match = url.match(regExp)
      const videoId = match ? match[1] : null
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
    return url
  }

  const getCurrentLessonIndex = () => {
    return allLessons.findIndex(l => l.id === lesson?.id)
  }

  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      router.push(`/dashboard/courses/${params.courseId}/modules/${params.moduleId}/lessons/${nextLesson.id}`)
    }
  }

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      router.push(`/dashboard/courses/${params.courseId}/modules/${params.moduleId}/lessons/${prevLesson.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Cargando lección...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Lección no encontrada</p>
            <Link href="/dashboard/courses">
              <Button className="mt-4">Volver a Cursos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const embedUrl = lesson.video_url ? getVideoEmbedUrl(lesson.video_url, lesson.video_type) : null
  const currentIndex = getCurrentLessonIndex()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/courses" className="hover:text-foreground">
            Cursos
          </Link>
          <span>/</span>
          <Link href={`/dashboard/courses/${params.courseId}`} className="hover:text-foreground">
            {course?.title}
          </Link>
          <span>/</span>
          <span className="text-foreground">{lesson.title}</span>
        </div>

        {/* Video Player */}
        {embedUrl && (
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-black">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    // Track video start
                    console.log('[v0] Video player loaded')
                  }}
                />
              </div>
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
                {lesson.duration_minutes && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Play className="h-4 w-4" />
                    <span>{lesson.duration_minutes} minutos</span>
                  </div>
                )}
              </div>
              <Button
                variant={progress?.completed ? "default" : "outline"}
                size="lg"
                onClick={toggleComplete}
                className="gap-2"
              >
                <CheckCircle2 className={`h-5 w-5 ${progress?.completed ? 'fill-current' : ''}`} />
                {progress?.completed ? 'Completada' : 'Marcar como completada'}
              </Button>
            </div>
          </CardHeader>
          {lesson.content && (
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {lesson.content}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousLesson}
            disabled={currentIndex === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Lección Anterior
          </Button>
          <Button
            variant="outline"
            onClick={goToNextLesson}
            disabled={currentIndex === allLessons.length - 1}
            className="gap-2 bg-transparent"
          >
            Siguiente Lección
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Other Lessons in Module */}
        {allLessons.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Otras lecciones en este módulo</CardTitle>
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
                        <div>
                          <p className="font-medium text-foreground">{l.title}</p>
                          {l.duration_minutes && (
                            <p className="text-sm text-muted-foreground">
                              {l.duration_minutes} min
                            </p>
                          )}
                        </div>
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
