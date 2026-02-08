"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Camera, Mail, User, Lock, Bell, CreditCard, Award, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="space-y-8 p-8">
      {/* Botón Volver */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
          Mi Perfil
        </h1>
        <p className="mt-2 text-muted-foreground">
          Administra tu información personal y preferencias de la cuenta
        </p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                variant="secondary"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground">Juan Pérez</h2>
              <p className="text-muted-foreground">juan.perez@email.com</p>
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                <Badge variant="secondary">Miembro Premium</Badge>
                <Badge variant="outline">Estudiante Activo</Badge>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Cursos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Certificados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12.5h</p>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información de perfil y detalles personales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Juan" defaultValue="Juan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Pérez" defaultValue="Pérez" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@email.com"
                  defaultValue="juan.perez@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" placeholder="+34 123 456 789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <textarea
                  id="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Mantén tu cuenta segura actualizando tu contraseña regularmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Actualizar Contraseña</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticación de Dos Factores</CardTitle>
              <CardDescription>
                Agrega una capa extra de seguridad a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Requiere un código adicional al iniciar sesión
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <Button variant="outline" className="w-full bg-transparent">
                Configurar Autenticación
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificación
              </CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibes notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nuevos Cursos</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones cuando se publiquen nuevos cursos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones de Cursos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre actualizaciones en tus cursos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mensajes de la Comunidad</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones de mensajes y menciones
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Llamadas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recordatorios antes de sesiones en vivo programadas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter Semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumen semanal de contenido y novedades
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Actual
              </CardTitle>
              <CardDescription>
                Administra tu suscripción y métodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/50 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Plan Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Acceso completo a todos los cursos y contenido exclusivo
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">$49</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  </div>
                  <Badge>Activo</Badge>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Próxima facturación: <span className="font-medium text-foreground">15 de Marzo, 2024</span>
                  </p>
                  <p className="text-muted-foreground">
                    Método de pago: <span className="font-medium text-foreground">•••• •••• •••• 4242</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Cambiar Plan
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Actualizar Pago
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Facturas</CardTitle>
              <CardDescription>
                Descarga tus facturas y recibos anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "15 Feb 2024", amount: "$49.00", status: "Pagado" },
                  { date: "15 Ene 2024", amount: "$49.00", status: "Pagado" },
                  { date: "15 Dic 2023", amount: "$49.00", status: "Pagado" },
                ].map((invoice, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{invoice.status}</Badge>
                      <Button variant="ghost" size="sm">
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Mis Certificados
              </CardTitle>
              <CardDescription>
                Certificados obtenidos por completar cursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Fundamentos de Bitcoin",
                    date: "Completado el 15 Enero 2024",
                    id: "CERT-001234",
                  },
                  {
                    title: "Trading Avanzado",
                    date: "Completado el 28 Diciembre 2023",
                    id: "CERT-001189",
                  },
                  {
                    title: "Introducción a DeFi",
                    date: "Completado el 10 Noviembre 2023",
                    id: "CERT-001098",
                  },
                ].map((cert, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.date}</p>
                      <p className="text-xs text-muted-foreground">ID: {cert.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Ver
                      </Button>
                      <Button size="sm" className="flex-1">
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
