'use client'

import React, { Suspense } from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const CHECKOUT_URL = 'https://uwjjtmnesnjjqxkiacjt.supabase.co/functions/v1/create-checkout'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Usuario no encontrado o contrasena incorrecta.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu correo electronico antes de iniciar sesion.')
        } else {
          setError(error.message)
        }
      } else {
        sessionStorage.removeItem('pendingPlan')

        // Check localStorage for a pending priceId (set from /inscribete)
        const pendingPriceId = localStorage.getItem('pendingPriceId')
        if (pendingPriceId) {
          localStorage.removeItem('pendingPriceId')
          localStorage.removeItem('pendingPlan')

          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const res = await fetch(CHECKOUT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              },
              body: JSON.stringify({
                priceId: pendingPriceId,
                email: session.user.email,
                userId: session.user.id,
              }),
            })
            const text = await res.text()
            let json: any = {}
            try { json = JSON.parse(text) } catch { /* non-JSON */ }
            if (json?.url) {
              window.location.assign(json.url)
              return
            } else {
              setError('No se recibi\u00f3 URL de pago: ' + text.slice(0, 100))
              return
            }
          }
        }

        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrio un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo y contraseña para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-secondary text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-secondary pr-10 text-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href={plan ? `/registro?plan=${plan}` : '/registro'} className="font-medium text-primary transition-colors hover:underline">
              {'Registrate'}
            </Link>
          </p>
        </CardFooter>
        </Card>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLayout><div className="h-96 animate-pulse rounded-lg bg-secondary" /></AuthLayout>}>
      <LoginForm />
    </Suspense>
  )
}
