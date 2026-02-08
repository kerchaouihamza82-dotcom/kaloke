import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

export function createAdminClient() {
  return createClient(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
