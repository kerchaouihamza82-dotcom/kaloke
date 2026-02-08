'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const secret = formData.get('secret') as string

    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, secret })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear administrador')
      }

      setSuccess(true)
      toast.success('¡Administrador creado exitosamente!')
    } catch (error: any) {
      console.error('[v0] Error:', error)
      toast.error(error.message || 'Error al crear administrador')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">¡Administrador Creado!</h2>
            <p className="mb-6 text-muted-foreground">
              Ya puedes iniciar sesión con tus credenciales
            </p>
            <Button asChild className="w-full">
              <a href="/login">Ir a Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configurar Administrador</CardTitle>
          <CardDescription>
            Crea la cuenta de administrador principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="admin@digicash.academy"
                required
              />
              <p className="text-xs text-muted-foreground">
                No necesita ser un email real
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue="gmjhdigicash$"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Clave Secreta</Label>
              <Input
                id="secret"
                name="secret"
                type="password"
                placeholder="Clave secreta de seguridad"
                required
              />
              <p className="text-xs text-muted-foreground">
                gmjhdigicash-secret-2024
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Administrador'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
