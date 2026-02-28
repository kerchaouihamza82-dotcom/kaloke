'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return user
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, table, data, id } = await request.json()

  try {
    if (action === 'insert') {
      const { data: result, error } = await supabaseAdmin
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return Response.json({ data: result })
    }

    if (action === 'update') {
      const { data: result, error } = await supabaseAdmin
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return Response.json({ data: result })
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      return Response.json({ success: true })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[Admin API] Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
