'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function test() {
      try {
        // Test 1: Llamar al checkout con plan-mensual
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: 'plan-mensual' }),
          credentials: 'include',
        })
        
        const text = await res.text()
        let json = null
        try { json = JSON.parse(text) } catch {}
        
        setResult({
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: json || text,
          timestamp: new Date().toISOString(),
        })
      } catch (err: any) {
        setResult({
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }
    test()
  }, [])

  if (loading) {
    return (
      <div className="p-8 font-mono">
        <h1 className="text-2xl mb-4">Diagnosticando checkout...</h1>
        <p>Espera unos segundos...</p>
      </div>
    )
  }

  return (
    <div className="p-8 font-mono">
      <h1 className="text-2xl mb-4">Resultado del diagnóstico</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(result, null, 2)}
      </pre>
      <p className="mt-4 text-sm text-gray-600">
        Copia este resultado y pégalo en el chat.
      </p>
    </div>
  )
}
