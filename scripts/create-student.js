const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const email = 'josepetcasino@gmail.com'
  const password = '123456$'

  // 1. Create auth user
  console.log('Creating auth user:', email)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Jose Pet Casino' },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('User already exists, fetching...')
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existingUser = users.find(u => u.email === email)
      if (existingUser) {
        // Update password
        await supabase.auth.admin.updateUserById(existingUser.id, { password })
        console.log('Password updated for existing user:', existingUser.id)
        
        // Ensure profile exists with student role
        await supabase.from('profiles').upsert({
          id: existingUser.id,
          email,
          full_name: 'Jose Pet Casino',
          role: 'student',
        }, { onConflict: 'id' })
        console.log('Profile ensured with role=student')

        // Ensure user_profiles exists with has_access=true
        await supabase.from('user_profiles').upsert({
          id: existingUser.id,
          has_access: true,
          subscription_type: 'student',
          subscribed_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        console.log('user_profiles ensured with has_access=true')
        console.log('DONE! Student can login with', email, '/', password)
        return
      }
    }
    console.error('Auth error:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log('Auth user created:', userId)

  // 2. Create profile with student role
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: 'Jose Pet Casino',
    role: 'student',
  }, { onConflict: 'id' })

  if (profileError) console.error('Profile error:', profileError.message)
  else console.log('Profile created with role=student')

  // 3. Give access in user_profiles
  const { error: accessError } = await supabase.from('user_profiles').upsert({
    id: userId,
    has_access: true,
    subscription_type: 'student',
    subscribed_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  if (accessError) console.error('Access error:', accessError.message)
  else console.log('user_profiles created with has_access=true')

  console.log('DONE! Student can login with', email, '/', password)
}

main()
