import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const PRICE_IDS: Record<string, string> = {
  mensual: 'price_1T7cBgGXPveWbaAfVlivnMcG',
  anual: 'price_1T7cE1GXPveWbaAfZHbjhuxj',
}

const CHECKOUT_URL = 'https://uwjjtmnesnjjqxkiacjt.supabase.co/functions/v1/create-checkout'

export async function handleSubscription(plan: 'mensual' | 'anual') {
  const supabase = createClient()

  // Use getSession() as the single source of truth — avoids "Auth session missing" race condition
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    toast.error('Error de autenticación: ' + sessionError.message)
    return
  }

  // If no active session, redirect to login with the plan as query param
  if (!session) {
    sessionStorage.setItem('pendingPlan', plan)
    window.location.href = `/login?plan=${plan}`
    return
  }

  const priceId = PRICE_IDS[plan]
  const email = session.user.email!
  const userId = session.user.id
  const token = session.access_token

  // Fetch Edge Function
  let response: Response
  try {
    response = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ priceId, email, userId }),
    })
  } catch (networkErr: any) {
    toast.error('Error de red: ' + networkErr.message)
    return
  }

  // Read body as text first to safely handle any response format
  const rawText = await response.text()

  let data: any = {}
  try {
    data = JSON.parse(rawText)
  } catch {
    toast.error('Respuesta inesperada del servidor: ' + rawText.slice(0, 200))
    return
  }

  if (!response.ok) {
    toast.error('Error al crear la sesión de pago: ' + (data.error || data.message || `HTTP ${response.status}`))
    return
  }

  // Redirect to Stripe Checkout
  if (data?.url) {
    window.location.assign(data.url)
  } else {
    toast.error('No se recibió la URL de pago. Respuesta: ' + JSON.stringify(data))
  }
}

