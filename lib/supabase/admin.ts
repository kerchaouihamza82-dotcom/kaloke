import { createMockClient } from './mock-client'

export function createAdminClient() {
  return createMockClient() as any
}
