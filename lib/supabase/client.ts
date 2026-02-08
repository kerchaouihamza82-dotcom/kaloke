import { createMockClient } from './mock-client'

export function createClient() {
  return createMockClient() as any
}
