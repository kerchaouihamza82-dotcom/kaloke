// ==========================================================
// Supabase Client – Simulation Layer
// Swap this file's contents with the real createBrowserClient
// when connecting to production Supabase.
// ==========================================================
import { createFakeClient } from '@/lib/fake-supabase/client'

export function createClient() {
  return createFakeClient()
}
