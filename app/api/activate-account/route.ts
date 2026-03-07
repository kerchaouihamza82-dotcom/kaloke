import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña son requeridos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    // Buscar el token válido
    const { data: tokenRow, error: tokenError } = await admin
      .from('password_setup_tokens')
      .select('user_id, used, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (tokenError || !tokenRow) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    if (tokenRow.used) {
      return NextResponse.json({ error: 'Este enlace ya fue utilizado' }, { status: 400 })
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El enlace ha expirado. Contacta soporte.' }, { status: 400 })
    }

    // Obtener email del usuario
    const { data: { user }, error: userError } = await admin.auth.admin.getUserById(tokenRow.user_id)
    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    // Actualizar contraseña
    const { error: updateError } = await admin.auth.admin.updateUserById(tokenRow.user_id, { password })
    if (updateError) {
      return NextResponse.json({ error: 'Error actualizando contraseña' }, { status: 500 })
    }

    // Marcar token como usado
    await admin.from('password_setup_tokens').update({ used: true }).eq('token', token)

    return NextResponse.json({ email: user.email })
  } catch (error: any) {
    console.error('[activate-account] Error:', error.message)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
