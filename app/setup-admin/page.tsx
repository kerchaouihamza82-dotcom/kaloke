'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLayout } from "@/components/auth-layout"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export default function SetupAdminPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function createAdminUser() {
    setStatus('creating')
    setMessage('Creando usuario administrador...')

    try {
      const supabase = createClient()
      
      // Registrar usuario
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@digicash.academy',
        password: 'gmjhdigicash$',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: 'Administrador DigiCash',
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setMessage('El usuario admin ya existe. Puedes iniciar sesión.')
          setStatus('success')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          throw error
        }
        return
      }

      if (data.user) {
        setMessage('¡Usuario administrador creado exitosamente!')
        setStatus('success')
        
        // Esperar 2 segundos y redirigir al login
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Error al crear el usuario administrador')
    }
  }

  return (
    <AuthLayout>
      <Card className="border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">
            Configuración Inicial
          </CardTitle>
          <CardDescription>
            Crea el usuario administrador de DigiCash Academy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Credenciales del administrador:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📧 Email: <span className="font-mono text-foreground">admin@digicash.academy</span></p>
                  <p>🔒 Contraseña: <span className="font-mono text-foreground">gmjhdigicash$</span></p>
                </div>
              </div>

              <Button 
                onClick={createAdminUser}
                className="w-full"
                size="lg"
              >
                Crear Usuario Administrador
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                El sistema asignará automáticamente el rol de administrador
              </p>
            </div>
          )}

          {status === 'creating' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-foreground">¡Listo!</p>
                <p className="text-sm text-muted-foreground">{message}</p>
                <p className="text-xs text-muted-foreground">Redirigiendo al login...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-foreground">Error</p>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
              <Button 
                onClick={() => setStatus('idle')}
                variant="outline"
              >
                Intentar de nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
