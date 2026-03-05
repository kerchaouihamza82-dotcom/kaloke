import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[v0] admin/write - missing env vars', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await request.json()
    const { action, table, data, id } = body
    console.log('[v0] admin/write - action:', action, 'table:', table, 'data:', JSON.stringify(data))

    let result: any

    if (action === 'insert') {
      result = await supabaseAdmin.from(table).insert([data]).select()
    } else if (action === 'update') {
      result = await supabaseAdmin.from(table).update(data).eq('id', id).select()
    } else if (action === 'delete') {
      result = await supabaseAdmin.from(table).delete().eq('id', id)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    console.log('[v0] admin/write - error:', result.error?.message, 'data:', JSON.stringify(result.data))

    if (result.error) {
      return NextResponse.json({
        error: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
      }, { status: 400 })
    }

    return NextResponse.json({ data: result.data })

  } catch (err: any) {
    console.error('[v0] admin/write - unexpected error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
