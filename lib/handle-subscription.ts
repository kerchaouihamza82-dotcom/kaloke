import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const PLAN_TO_PRODUCT_ID: Record<string, string> = {
  mensual: 'plan-mensual',
  anual: 'plan-completo',
}

export async function handleSubscription(plan: 'mensual' | 'anual') {
  const supabase = createClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    toast.error('Error de autenticación: ' + sessionError.message)
    return
  }

  if (!session) {
    sessionStorage.setItem('pendingPlan', plan)
    window.location.href = `/login?plan=${plan}`
    return
  }

  const productId = PLAN_TO_PRODUCT_ID[plan]
  const userId = session.user.id

  let response: Response
  try {
    response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, userId }),
    })
  } catch (networkErr: any) {
    toast.error('Error de red: ' + networkErr.message)
    return
  }

  const rawText = await response.text()
  let data: any = {}
  try {
    data = JSON.parse(rawText)
  } catch {
    toast.error('Respuesta inesperada del servidor')
    return
  }

  if (!response.ok) {
    toast.error('Error al crear la sesión de pago: ' + (data.error || `HTTP ${response.status}`))
    return
  }

  if (data?.url) {
    window.location.assign(data.url)
  } else {
    toast.error('No se recibió la URL de pago')
  }
}
