'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ArrowLeft, PlayCircle, Check, ChevronRight, ChevronLeft, Lock } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { Progress } from '@/components/ui/progress'
import { handleSubscription } from '@/lib/handle-subscription'
import { toast } from 'sonner'

interface Curso {
  id: string
  titulo: string
  instructor: string
  imagen_url?: string
}

interface Modulo {
  id: string
  titulo: string
  orden_index: number
  sesiones: Sesion[]
}

interface Sesion {
  id: string
  titulo: string
  video_url: string
  orden_index: number
}

export default function CourseViewerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  
  const [course, setCourse] = useState<Curso | null>(null)
  const [modules, setModules] = useState<Modulo[]>([])
  const [currentSesion, setCurrentSesion] = useState<Sesion | null>(null)
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedSesiones, setCompletedSesiones] = useState<Set<string>>(new Set())
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      const supabase = createClient()

      // Check subscription status
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: suscripcion } = await supabase
          .from('suscripciones')
          .select('estado')
          .eq('user_id', user.id)
          .single()

        setHasActiveSubscription(suscripcion?.estado === 'activa')

        // Also check if user is admin (admins always have access)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          setHasActiveSubscription(true)
        }
      }
      
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('id, titulo, instructor, imagen_url')
        .eq('id', courseId)
        .single()

      if (cursoError) throw cursoError
      setCourse(cursoData)

      const { data: modulosData, error: modulosError } = await supabase
        .from('modulos')
        .select(`
          id,
          titulo,
          orden_index,
          sesiones (
            id,
            titulo,
            video_url,
            orden_index
          )
        `)
        .eq('curso_id', courseId)
        .order('orden_index', { ascending: true })

      if (modulosError) throw modulosError

      const formattedModulos = modulosData?.map(modulo => ({
        ...modulo,
        sesiones: (modulo.sesiones as Sesion[]).sort((a, b) => a.orden_index - b.orden_index)
      })) || []

      setModules(formattedModulos)

      // Auto-select first session
      if (formattedModulos.length > 0 && formattedModulos[0].sesiones.length > 0) {
        setCurrentSesion(formattedModulos[0].sesiones[0])
        setCurrentModuleId(formattedModulos[0].id)
      }
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSesionClick = (sesion: Sesion, moduleId: string) => {
    setCurrentSesion(sesion)
    setCurrentModuleId(moduleId)
  }

  const markAsCompleted = () => {
    if (currentSesion) {
      setCompletedSesiones(prev => new Set([...prev, currentSesion.id]))
    }
  }

  const goToNextSesion = () => {
    if (!currentSesion || !currentModuleId) return

    const currentModule = modules.find(m => m.id === currentModuleId)
    if (!currentModule) return

    const currentIndex = currentModule.sesiones.findIndex(s => s.id === currentSesion.id)
    
    // Try next session in same module
    if (currentIndex < currentModule.sesiones.length - 1) {
      setCurrentSesion(currentModule.sesiones[currentIndex + 1])
      return
    }

    // Try first session of next module
    const moduleIndex = modules.findIndex(m => m.id === currentModuleId)
    if (moduleIndex < modules.length - 1 && modules[moduleIndex + 1].sesiones.length > 0) {
      setCurrentModuleId(modules[moduleIndex + 1].id)
      setCurrentSesion(modules[moduleIndex + 1].sesiones[0])
    }
  }

  const goToPreviousSesion = () => {
    if (!currentSesion || !currentModuleId) return

    const currentModule = modules.find(m => m.id === currentModuleId)
    if (!currentModule) return

    const currentIndex = currentModule.sesiones.findIndex(s => s.id === currentSesion.id)
    
    // Try previous session in same module
    if (currentIndex > 0) {
      setCurrentSesion(currentModule.sesiones[currentIndex - 1])
      return
    }

    // Try last session of previous module
    const moduleIndex = modules.findIndex(m => m.id === currentModuleId)
    if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1]
      if (prevModule.sesiones.length > 0) {
        setCurrentModuleId(prevModule.id)
        setCurrentSesion(prevModule.sesiones[prevModule.sesiones.length - 1])
      }
    }
  }

  const getTotalSesiones = () => {
    return modules.reduce((total, modulo) => total + modulo.sesiones.length, 0)
  }

  const getProgress = () => {
    const total = getTotalSesiones()
    if (total === 0) return 0
    return Math.round((completedSesiones.size / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-white">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course || !currentSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-white">Curso no disponible</p>
          <Link href="/dashboard/courses">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a cursos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Main Content - Video Player */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/courses">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            {course.imagen_url && (
              <div className="h-10 w-16 overflow-hidden rounded">
                <img
                  src={course.imagen_url}
                  alt={course.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <h1 className="text-xl font-bold">{course.titulo}</h1>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 p-6">
          {hasActiveSubscription === false ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-950 px-8 py-20">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
                <Lock className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="mb-3 text-2xl font-bold">Contenido bloqueado</h2>
              <p className="mb-8 max-w-md text-center leading-relaxed text-gray-400">
                {'Necesitas una suscripción activa para acceder a las lecciones de este curso. Elige un plan y comienza a aprender hoy.'}
              </p>
              <div className="flex gap-4">
                <Button
                  className="bg-blue-600 px-8 py-6 text-base hover:bg-blue-700"
                  disabled={subscribing}
                  onClick={async () => {
                    setSubscribing(true)
                    try { await handleSubscription('mensual') }
                    catch (e: any) { toast.error(e.message) }
                    finally { setSubscribing(false) }
                  }}
                >
                  {subscribing ? 'Procesando...' : 'Plan Mensual - $9.99/mes'}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-700 px-8 py-6 text-base hover:bg-gray-800"
                  disabled={subscribing}
                  onClick={async () => {
                    setSubscribing(true)
                    try { await handleSubscription('anual') }
                    catch (e: any) { toast.error(e.message) }
                    finally { setSubscribing(false) }
                  }}
                >
                  {'Plan Anual - $2,500'}
                </Button>
              </div>
            </div>
          ) : (
          <VideoPlayer videoUrl={currentSesion.video_url} title={currentSesion.titulo} />
          
          {/* Lesson Title and Controls */}
          <div className="mt-6">
            <h2 className="mb-4 text-2xl font-bold">{currentSesion.titulo}</h2>
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousSesion}
                className="border-gray-700 bg-transparent text-white hover:bg-gray-800"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant={completedSesiones.has(currentSesion.id) ? "default" : "outline"}
                  onClick={markAsCompleted}
                  className={completedSesiones.has(currentSesion.id) ? "" : "border-gray-700 bg-transparent text-white hover:bg-gray-800"}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {completedSesiones.has(currentSesion.id) ? 'Completada' : 'Marcar como completa'}
                </Button>
                
                <Button onClick={goToNextSesion}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">TU PROGRESO</span>
                <span className="font-semibold">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Sidebar - Course Content */}
      <div className="w-96 border-l border-gray-800 bg-gray-950">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-bold">Contenido</h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-73px)]">
          <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="px-2">
            {modules.map((modulo) => (
              <AccordionItem key={modulo.id} value={modulo.id} className="border-gray-800">
                <AccordionTrigger className="py-4 text-left hover:no-underline hover:bg-gray-900/50">
                  <div className="flex-1">
                    <h3 className="font-semibold">{modulo.titulo}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {modulo.sesiones.length} {modulo.sesiones.length === 1 ? 'lección' : 'lecciones'}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-1">
                    {modulo.sesiones.map((sesion, index) => (
                      <button
                        key={sesion.id}
                        onClick={() => handleSesionClick(sesion, modulo.id)}
                        className={`flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors ${
                          currentSesion?.id === sesion.id
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-900/50 hover:text-white'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {completedSesiones.has(sesion.id) ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <PlayCircle className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1 text-sm">
                          <p className={currentSesion?.id === sesion.id ? 'font-medium' : ''}>
                            Lección {index + 1}
                          </p>
                          <p className="text-xs">{sesion.titulo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  )
}
