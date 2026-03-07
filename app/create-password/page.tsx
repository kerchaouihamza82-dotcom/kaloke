'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock } from 'lucide-react'

function CreatePasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) router.push('/')
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/activate-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Error activando cuenta'); return }

      // Iniciar sesión automáticamente
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email: data.email, password })

      toast.success('¡Cuenta activada! Bienvenido a DigiCash Academy')
      router.push('/dashboard')
    } catch {
      toast.error('Error al activar la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Crea tu contraseña</CardTitle>
          <CardDescription>
            Tu pago fue exitoso. Crea una contraseña para acceder a DigiCash Academy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type={show ? 'text' : 'password'}
                placeholder="Contraseña (mínimo 8 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShow(v => !v)}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input
              type={show ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Activando...' : 'Activar cuenta y entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <CreatePasswordContent />
    </Suspense>
  )
}
