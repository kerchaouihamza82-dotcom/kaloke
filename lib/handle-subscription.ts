import { createClient } from '@/lib/supabase/client'

const PRICE_IDS: Record<string, string> = {
  mensual: 'price_1SrR7URUc0SIWrwDLZbISOX8',
  anual: 'price_1T5oneRUc0SIWrwD0xAJAaew',
}

const CHECKOUT_URL = 'https://uwjjtmnesnjjqxkiacjt.supabase.co/functions/v1/create-checkout'

export async function handleSubscription(plan: 'mensual' | 'anual') {
  const supabase = createClient()

  // 1. Verify user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('[subscription] Auth error:', userError.message)
    throw new Error('Error de autenticación: ' + userError.message)
  }
  if (!user) {
    window.location.href = '/login'
    return
  }

  // 2. Get valid price ID
  const priceId = PRICE_IDS[plan]
  if (!priceId) throw new Error('Plan no válido: ' + plan)

  // 3. Get session token for Authorization header
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  // 4. Build request body
  const body = JSON.stringify({ email: user.email, userId: user.id, priceId })
  console.log('[subscription] Sending to Edge Function:', { url: CHECKOUT_URL, email: user.email, userId: user.id, priceId })

  // 5. Call Edge Function
  let response: Response
  try {
    response = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body,
    })
  } catch (networkErr: any) {
    console.error('[subscription] Network error:', networkErr)
    throw new Error('Error de red al conectar con el servidor de pagos: ' + networkErr.message)
  }

  // 6. Read response body as text first (safe for any content type)
  const rawText = await response.text()
  console.log('[subscription] Response status:', response.status)
  console.log('[subscription] Response body:', rawText)

  // 7. Parse JSON
  let data: any = {}
  try {
    data = JSON.parse(rawText)
  } catch {
    console.error('[subscription] Response is not JSON:', rawText)
    throw new Error('Respuesta inesperada del servidor: ' + rawText.slice(0, 200))
  }

  // 8. Handle error responses
  if (!response.ok) {
    const msg = data?.error || data?.message || `HTTP ${response.status}`
    console.error('[subscription] Edge Function error:', msg, data)
    throw new Error('Error al crear la sesión de pago: ' + msg)
  }

  // 9. Redirect to Stripe Checkout
  if (data?.url) {
    console.log('[subscription] Redirecting to:', data.url)
    window.location.href = data.url
  } else {
    console.error('[subscription] Missing URL in response:', data)
    throw new Error('No se recibió la URL de pago. Respuesta: ' + JSON.stringify(data))
  }
}
