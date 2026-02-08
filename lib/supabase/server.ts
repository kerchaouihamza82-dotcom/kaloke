// ==========================================================
// Supabase Server Client – Simulation Layer
// In production, replace with createServerClient from @supabase/ssr.
// ==========================================================
import { createFakeClient } from '@/lib/fake-supabase/client'

export async function createClient() {
  return createFakeClient()
}
