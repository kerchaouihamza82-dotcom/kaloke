import { createClient } from '@/lib/supabase/client'

const PRICE_IDS: Record<string, string> = {
  mensual: 'price_1SrR7URUc0SIWrwDLZbISOX8',
  anual: 'price_1T5oneRUc0SIWrwD0xAJAaew',
}

const CHECKOUT_URL = 'https://uwjjtmnesnjjqxkiacjt.supabase.co/functions/v1/create-checkout'

export async function handleSubscription(plan: 'mensual' | 'anual') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = '/login'
    return
  }

  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    throw new Error('Plan no válido')
  }

  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({
      email: user.email,
      userId: user.id,
      priceId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Error al crear la sesión de pago')
  }

  const data = await response.json()

  if (data.url) {
    window.location.href = data.url
  } else {
    throw new Error('No se recibió la URL de pago')
  }
}
