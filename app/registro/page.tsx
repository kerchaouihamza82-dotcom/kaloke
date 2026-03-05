'use client'

import React, { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const CHECKOUT_URL = 'https://uwjjtmnesnjjqxkiacjt.supabase.co/functions/v1/create-checkout'

const PRICE_IDS: Record<string, string> = {
  mensual: 'price_1T7cBgGXPveWbaAfVlivnMcG',
  anual: 'price_1T7cE1GXPveWbaAfZHbjhuxj',
}

function RegistroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nombre },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // If email confirmation is disabled, log in directly
      if (data.session) {
        // Check for pending priceId in localStorage (set by /inscribete when not logged in)
        const pendingPriceId = localStorage.getItem('pendingPriceId')
        const pendingPlan = localStorage.getItem('pendingPlan') || plan

        if (pendingPriceId) {
          localStorage.removeItem('pendingPriceId')
          localStorage.removeItem('pendingPlan')

          // Call Stripe checkout directly with fresh session data
          try {
            const res = await fetch(CHECKOUT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session.access_token}`,
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              },
              body: JSON.stringify({
                priceId: pendingPriceId,
                email: data.session.user.email,
                userId: data.session.user.id,
              }),
            })

            const text = await res.text()
            let json: any = {}
            try { json = JSON.parse(text) } catch { /* non-JSON */ }

            if (json?.url) {
              window.location.assign(json.url)
              return
            } else {
              setError('No se recibió URL de pago: ' + text.slice(0, 100))
              return
            }
          } catch (fetchErr: any) {
            setError('Error al crear sesión de pago: ' + fetchErr.message)
            return
          }
        } else if (pendingPlan === 'mensual' || pendingPlan === 'anual') {
          // Plan came from URL param, no priceId saved — redirect to /inscribete to pick plan
          router.push('/inscribete')
          return
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        // Email confirmation required — show message
        setError('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta y luego inicia sesión.')
      }
    } catch (err: any) {
      setError('Error inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Crear cuenta</CardTitle>
          <CardDescription>
            {'Crea tu cuenta para empezar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className={`rounded-md p-3 text-sm ${error.startsWith('¡Registro') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                className="bg-secondary text-foreground"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-secondary text-foreground"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{'Contraseña'}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-secondary pr-10 text-foreground"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="bg-secondary text-foreground"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="h-11 w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{'Creando cuenta...'}</> : 'Crear cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            {'¿Ya tienes cuenta?'}{' '}
            <Link href={plan ? `/login?plan=${plan}` : '/login'} className="font-medium text-blue-400 transition-colors hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<AuthLayout><div className="h-96 animate-pulse rounded-lg bg-secondary" /></AuthLayout>}>
      <RegistroForm />
    </Suspense>
  )
}
