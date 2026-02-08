import { createMockClient } from './mock-client'

export async function createClient() {
  return createMockClient() as any
}
