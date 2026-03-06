/**
 * Redirects the user to the Stripe checkout page for a given plan.
 * Works from any client component.
 */
export async function handleSubscription(plan: 'mensual' | 'anual'): Promise<void> {
  const PRODUCT_IDS: Record<string, string> = {
    mensual: 'plan-mensual',
    anual: 'plan-completo',
  }

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId: PRODUCT_IDS[plan] }),
  })

  const text = await res.text()
  let data: any = {}
  try { data = JSON.parse(text) } catch { /* non-JSON */ }

  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Error ${res.status}: no se pudo iniciar el pago`)
  }

  window.location.assign(data.url)
}
