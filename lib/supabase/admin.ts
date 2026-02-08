// ==========================================================
// Supabase Admin Client – Simulation Layer
// In production, replace with createClient using SERVICE_ROLE_KEY.
// ==========================================================
import { createFakeClient } from '@/lib/fake-supabase/client'

export function createAdminClient() {
  return createFakeClient()
}
