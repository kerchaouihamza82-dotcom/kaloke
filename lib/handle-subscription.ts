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
    alert('Error de Supabase: ' + userError.message)
    return
  }
  if (!user) {
    // Save plan in sessionStorage AND pass it as query param so it survives page load
    sessionStorage.setItem('pendingPlan', plan)
    window.location.href = `/registro?plan=${plan}`
    return
  }

  const priceId = PRICE_IDS[plan]
  const email = user.email
  const userId = user.id

  // 2. Diagnostic log — verify no empty data before request
  console.log('Datos enviados:', { priceId, email, userId })

  if (!priceId || !email || !userId) {
    alert('Error: datos incompletos — priceId=' + priceId + ' | email=' + email + ' | userId=' + userId)
    return
  }

  // 3. Get session token
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  // 4. Call Edge Function with correct headers
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
    alert('Error de Supabase: ' + networkErr.message)
    return
  }

  // 5. Read response as plain text first (safe regardless of content type)
  const rawText = await response.text()
  console.log('Respuesta status:', response.status)
  console.log('Respuesta body:', rawText)

  // 6. Parse JSON safely
  let data: any = {}
  try {
    data = JSON.parse(rawText)
  } catch {
    alert('Error de Supabase: Respuesta no es JSON — ' + rawText.slice(0, 300))
    return
  }

  // 7. If error, show exact Supabase message
  if (!response.ok) {
    alert('Error de Supabase: ' + (data.error || data.message || `HTTP ${response.status} — ${rawText.slice(0, 200)}`))
    return
  }

  // 8. Redirect to Stripe Checkout
  if (data?.url) {
    window.location.href = data.url
  } else {
    alert('Error de Supabase: No se recibió URL de pago — ' + JSON.stringify(data))
  }
}

