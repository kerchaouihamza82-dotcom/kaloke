process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('--- SUPABASE DIAGNOSTIC ---')
console.log('URL:', url ? url.substring(0, 40) + '...' : 'MISSING')
console.log('SERVICE_ROLE_KEY:', serviceKey ? 'sk=' + serviceKey.substring(0, 20) + '...' : 'MISSING !!!')
console.log('ANON_KEY:', anonKey ? anonKey.substring(0, 20) + '...' : 'MISSING')

if (!url || !serviceKey) {
  console.error('CRITICAL: Missing env vars — cannot connect')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// 1. Test service role — list users (requires service role)
console.log('\n[1] Testing admin.listUsers() ...')
const { data: users, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 1 })
if (usersErr) {
  console.error('   FAILED:', usersErr.message, usersErr.status)
} else {
  console.log('   OK — total users found:', users.users.length)
  if (users.users.length > 0) {
    const u = users.users[0]
    console.log('   First user email:', u.email, '| id prefix:', u.id.substring(0, 8))

    // 2. Test getUserById
    console.log('\n[2] Testing admin.getUserById() ...')
    const { data: ud, error: ue } = await admin.auth.admin.getUserById(u.id)
    if (ue) {
      console.error('   FAILED:', ue.message)
    } else {
      console.log('   OK — got user:', ud.user.email)
    }
  }
}

// 3. Test user_profiles table
console.log('\n[3] Testing user_profiles table ...')
const { data: profiles, error: profErr } = await admin.from('user_profiles').select('user_id, stripe_customer_id, has_access').limit(3)
if (profErr) {
  console.error('   FAILED:', profErr.message, profErr.code)
} else {
  console.log('   OK — rows:', profiles.length)
  profiles.forEach(p => console.log('   row:', p.user_id?.substring(0,8), '| cid:', p.stripe_customer_id, '| access:', p.has_access))
}

// 4. Test suscripciones table
console.log('\n[4] Testing suscripciones table ...')
const { data: subs, error: subsErr } = await admin.from('suscripciones').select('user_id, estado, plan').limit(3)
if (subsErr) {
  console.error('   FAILED:', subsErr.message, subsErr.code)
} else {
  console.log('   OK — rows:', subs.length)
  subs.forEach(s => console.log('   row:', s.user_id?.substring(0,8), '| estado:', s.estado, '| plan:', s.plan))
}

console.log('\n--- DONE ---')
