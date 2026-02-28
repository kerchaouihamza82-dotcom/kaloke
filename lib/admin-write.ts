// Client-side helper for admin write operations
// Uses the /api/admin/write endpoint which bypasses RLS via service role

type AdminAction = 'insert' | 'update' | 'delete'

interface AdminWriteParams {
  action: AdminAction
  table: string
  data?: Record<string, unknown>
  id?: string
}

interface AdminWriteResult<T = unknown> {
  data?: T
  error?: string
  success?: boolean
}

export async function adminWrite<T = unknown>(params: AdminWriteParams): Promise<AdminWriteResult<T>> {
  const response = await fetch('/api/admin/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const result = await response.json()

  if (!response.ok) {
    return { error: result.error || 'Operation failed' }
  }

  return result
}
