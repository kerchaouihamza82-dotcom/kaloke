import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, secret } = await request.json()

    // Secret key to prevent unauthorized admin creation
    if (secret !== 'gmjhdigicash-secret-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Create user using regular signup (not admin API)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
          full_name: 'Administrador DigiCash'
        }
      }
    })

    if (authError) {
      console.error('[v0] Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 400 })
    }

    // Wait a moment for the profile trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update profile to admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin', full_name: 'Administrador DigiCash' })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('[v0] Error updating profile to admin:', profileError)
      // Don't fail if profile update fails, user can still login
    }

    return NextResponse.json({ 
      success: true,
      user: authData.user 
    })

  } catch (error: any) {
    console.error('[v0] Error in admin registration:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
