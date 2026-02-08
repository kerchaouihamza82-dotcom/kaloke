// ============================================================
// Fake Supabase Client
// Implements the same chainable API as the real @supabase/supabase-js
// client so every component works without changes.
// ============================================================

import {
  getStore,
  saveStore,
  getStoredSession,
  setStoredSession,
  type FakeUser,
} from './data'

// ---------- helpers ----------
function generateId(): string {
  return crypto.randomUUID()
}

function matchesFilter(row: Record<string, unknown>, column: string, value: unknown): boolean {
  return row[column] === value
}

// ---------- Auth state listeners ----------
type AuthListener = (event: string, session: { user: FakeUser } | null) => void
const _authListeners: Set<AuthListener> = new Set()

function notifyAuthListeners(event: string, user: FakeUser | null) {
  const session = user ? { user, access_token: 'fake-token', refresh_token: 'fake-token' } : null
  _authListeners.forEach((fn) => {
    try {
      fn(event, session as any)
    } catch {
      // ignore listener errors
    }
  })
}

// ---------- Realtime subscription helpers ----------
type RealtimeCallback = (payload: any) => void
const _realtimeSubscriptions: Map<string, Set<RealtimeCallback>> = new Map()

export function addRealtimeSubscription(table: string, cb: RealtimeCallback) {
  if (!_realtimeSubscriptions.has(table)) {
    _realtimeSubscriptions.set(table, new Set())
  }
  _realtimeSubscriptions.get(table)!.add(cb)
  return () => {
    _realtimeSubscriptions.get(table)?.delete(cb)
  }
}

export function notifyRealtime(table: string, eventType: string, newRow: any, oldRow?: any) {
  const cbs = _realtimeSubscriptions.get(table)
  if (cbs) {
    cbs.forEach((cb) => {
      try {
        cb({ eventType, new: newRow, old: oldRow || null })
      } catch {
        // ignore
      }
    })
  }
}

// ---------- Query Builder ----------
class FakeQueryBuilder {
  private _table: string
  private _selectColumns: string = '*'
  private _filters: Array<{ column: string; op: string; value: unknown }> = []
  private _orderColumn: string | null = null
  private _orderAscending = true
  private _limitCount: number | null = null
  private _singleRow = false
  private _headOnly = false
  private _countMode: string | null = null
  private _insertData: any[] | null = null
  private _updateData: Record<string, unknown> | null = null
  private _deleteMode = false
  private _upsertData: any[] | null = null

  constructor(table: string) {
    this._table = table
  }

  // ---- SELECT ----
  select(columns: string = '*', options?: { count?: string; head?: boolean }) {
    this._selectColumns = columns
    if (options?.count) this._countMode = options.count
    if (options?.head) this._headOnly = true
    return this
  }

  // ---- INSERT ----
  insert(data: any | any[]) {
    this._insertData = Array.isArray(data) ? data : [data]
    return this
  }

  // ---- UPSERT ----
  upsert(data: any | any[]) {
    this._upsertData = Array.isArray(data) ? data : [data]
    return this
  }

  // ---- UPDATE ----
  update(data: Record<string, unknown>) {
    this._updateData = data
    return this
  }

  // ---- DELETE ----
  delete() {
    this._deleteMode = true
    return this
  }

  // ---- FILTERS ----
  eq(column: string, value: unknown) {
    this._filters.push({ column, op: 'eq', value })
    return this
  }

  neq(column: string, value: unknown) {
    this._filters.push({ column, op: 'neq', value })
    return this
  }

  gt(column: string, value: unknown) {
    this._filters.push({ column, op: 'gt', value })
    return this
  }

  gte(column: string, value: unknown) {
    this._filters.push({ column, op: 'gte', value })
    return this
  }

  lt(column: string, value: unknown) {
    this._filters.push({ column, op: 'lt', value })
    return this
  }

  lte(column: string, value: unknown) {
    this._filters.push({ column, op: 'lte', value })
    return this
  }

  in(column: string, values: unknown[]) {
    this._filters.push({ column, op: 'in', value: values })
    return this
  }

  like(column: string, pattern: string) {
    this._filters.push({ column, op: 'like', value: pattern })
    return this
  }

  ilike(column: string, pattern: string) {
    this._filters.push({ column, op: 'ilike', value: pattern })
    return this
  }

  is(column: string, value: unknown) {
    this._filters.push({ column, op: 'is', value })
    return this
  }

  // ---- ORDER ----
  order(column: string, options?: { ascending?: boolean }) {
    this._orderColumn = column
    this._orderAscending = options?.ascending !== false
    return this
  }

  // ---- LIMIT ----
  limit(count: number) {
    this._limitCount = count
    return this
  }

  // ---- SINGLE / MAYBESINGLE ----
  single() {
    this._singleRow = true
    return this._execute()
  }

  maybeSingle() {
    this._singleRow = true
    return this._execute()
  }

  // ---- then() makes the builder thenable so it works with await ----
  then(resolve: (value: any) => any, reject?: (reason: any) => any) {
    return this._execute().then(resolve, reject)
  }

  // ---- EXECUTE ----
  private async _execute(): Promise<{ data: any; error: any; count?: number | null }> {
    const store = getStore()
    const table = store[this._table as keyof typeof store] as any[]

    if (!table && !this._insertData && !this._upsertData) {
      return { data: null, error: { message: `Table ${this._table} not found`, code: '42P01' } }
    }

    // ---- INSERT ----
    if (this._insertData) {
      const targetTable = (store as any)[this._table] as any[] | undefined
      if (!targetTable) {
        (store as any)[this._table] = []
      }
      const inserted: any[] = []
      for (const row of this._insertData) {
        const now = new Date().toISOString()
        const newRow = {
          id: row.id || generateId(),
          ...row,
          created_at: row.created_at || now,
          updated_at: row.updated_at || now,
        }
        ;((store as any)[this._table] as any[]).push(newRow)
        inserted.push(newRow)
        notifyRealtime(this._table, 'INSERT', newRow)
      }
      saveStore()

      // If there's a select() chained after insert, return the inserted data
      if (this._selectColumns) {
        if (this._singleRow) {
          return { data: inserted[0] || null, error: null }
        }
        return { data: inserted, error: null }
      }
      return { data: inserted, error: null }
    }

    // ---- UPSERT ----
    if (this._upsertData) {
      const targetTable = (store as any)[this._table] as any[] | undefined
      if (!targetTable) {
        (store as any)[this._table] = []
      }
      const result: any[] = []
      for (const row of this._upsertData) {
        const existingIndex = ((store as any)[this._table] as any[]).findIndex(
          (r: any) => r.id === row.id
        )
        const now = new Date().toISOString()
        if (existingIndex >= 0) {
          const updated = { ...((store as any)[this._table] as any[])[existingIndex], ...row, updated_at: now }
          ;((store as any)[this._table] as any[])[existingIndex] = updated
          result.push(updated)
          notifyRealtime(this._table, 'UPDATE', updated)
        } else {
          const newRow = { id: row.id || generateId(), ...row, created_at: now, updated_at: now }
          ;((store as any)[this._table] as any[]).push(newRow)
          result.push(newRow)
          notifyRealtime(this._table, 'INSERT', newRow)
        }
      }
      saveStore()
      if (this._singleRow) return { data: result[0] || null, error: null }
      return { data: result, error: null }
    }

    // ---- DELETE ----
    if (this._deleteMode) {
      const targetTable = (store as any)[this._table] as any[]
      if (!targetTable) return { data: null, error: null }

      const toDelete: any[] = []
      const remaining: any[] = []

      for (const row of targetTable) {
        if (this._matchesAllFilters(row)) {
          toDelete.push(row)
          notifyRealtime(this._table, 'DELETE', row)

          // Cascade deletes
          if (this._table === 'courses') {
            const moduleIds = (store.modules || []).filter((m: any) => m.course_id === row.id).map((m: any) => m.id)
            store.lessons = (store.lessons || []).filter((l: any) => !moduleIds.includes(l.module_id))
            store.modules = (store.modules || []).filter((m: any) => m.course_id !== row.id)
            store.enrollments = (store.enrollments || []).filter((e: any) => e.course_id !== row.id)
          }
          if (this._table === 'modules') {
            store.lessons = (store.lessons || []).filter((l: any) => l.module_id !== row.id)
          }
        } else {
          remaining.push(row)
        }
      }

      ;(store as any)[this._table] = remaining
      saveStore()
      return { data: toDelete, error: null }
    }

    // ---- UPDATE ----
    if (this._updateData) {
      const targetTable = (store as any)[this._table] as any[]
      if (!targetTable) return { data: null, error: null }

      const updated: any[] = []
      for (let i = 0; i < targetTable.length; i++) {
        if (this._matchesAllFilters(targetTable[i])) {
          targetTable[i] = {
            ...targetTable[i],
            ...this._updateData,
            updated_at: new Date().toISOString(),
          }
          updated.push(targetTable[i])
          notifyRealtime(this._table, 'UPDATE', targetTable[i])
        }
      }
      saveStore()
      if (this._singleRow) return { data: updated[0] || null, error: null }
      return { data: updated, error: null }
    }

    // ---- SELECT ----
    let rows = [...(table || [])]

    // Apply filters
    rows = rows.filter((row) => this._matchesAllFilters(row))

    // Apply ordering
    if (this._orderColumn) {
      const col = this._orderColumn
      const asc = this._orderAscending
      rows.sort((a, b) => {
        const va = a[col]
        const vb = b[col]
        if (va < vb) return asc ? -1 : 1
        if (va > vb) return asc ? 1 : -1
        return 0
      })
    }

    // Apply limit
    if (this._limitCount !== null) {
      rows = rows.slice(0, this._limitCount)
    }

    // Handle count mode
    if (this._countMode) {
      if (this._headOnly) {
        return { data: null, error: null, count: rows.length }
      }
      return { data: rows, error: null, count: rows.length }
    }

    if (this._headOnly) {
      return { data: null, error: null, count: rows.length }
    }

    // Resolve joined / nested selects like "modules:modules(count)" or "*, modules:modules(count)"
    if (this._selectColumns && this._selectColumns !== '*') {
      rows = rows.map((row) => this._resolveSelect(row))
    }

    if (this._singleRow) {
      if (rows.length === 0) {
        return { data: null, error: { message: 'Row not found', code: 'PGRST116', details: null } }
      }
      return { data: rows[0], error: null }
    }

    return { data: rows, error: null }
  }

  private _matchesAllFilters(row: Record<string, unknown>): boolean {
    return this._filters.every((f) => {
      const val = row[f.column]
      switch (f.op) {
        case 'eq':
          return val === f.value
        case 'neq':
          return val !== f.value
        case 'gt':
          return (val as number) > (f.value as number)
        case 'gte':
          return (val as number) >= (f.value as number)
        case 'lt':
          return (val as number) < (f.value as number)
        case 'lte':
          return (val as number) <= (f.value as number)
        case 'in':
          return (f.value as unknown[]).includes(val)
        case 'like':
          return new RegExp((f.value as string).replace(/%/g, '.*')).test(String(val))
        case 'ilike':
          return new RegExp((f.value as string).replace(/%/g, '.*'), 'i').test(String(val))
        case 'is':
          return val === f.value
        default:
          return true
      }
    })
  }

  private _resolveSelect(row: Record<string, unknown>): Record<string, unknown> {
    const store = getStore()
    const result: Record<string, unknown> = {}

    // Parse select string
    const parts = this._selectColumns.split(',').map((s) => s.trim())

    for (const part of parts) {
      if (part === '*') {
        Object.assign(result, row)
        continue
      }

      // Handle relationship queries: "alias:table(select)" or "table(select)"
      const relMatch = part.match(/^(\w+):(\w+)\((.+)\)$/) || part.match(/^(\w+)\((.+)\)$/)
      if (relMatch) {
        const alias = relMatch.length === 4 ? relMatch[1] : relMatch[1]
        const relTable = relMatch.length === 4 ? relMatch[2] : relMatch[1]
        const relSelect = relMatch.length === 4 ? relMatch[3] : relMatch[2]

        const relData = (store as any)[relTable] as any[] | undefined
        if (!relData) {
          result[alias] = []
          continue
        }

        // Determine the foreign key
        let fkColumn: string
        let fkValue: unknown

        // Check if relTable has a FK to this table (e.g., modules has course_id)
        const singularTable = this._table.endsWith('s') ? this._table.slice(0, -1) : this._table
        fkColumn = `${singularTable}_id`

        // Check reverse relationship as well
        const singularRel = relTable.endsWith('s') ? relTable.slice(0, -1) : relTable
        const reverseFk = `${singularRel}_id`

        let related: any[]
        if (relData.length > 0 && relData[0][fkColumn] !== undefined) {
          related = relData.filter((r) => r[fkColumn] === row.id)
        } else if (row[reverseFk] !== undefined) {
          related = relData.filter((r) => r.id === row[reverseFk])
        } else {
          related = []
        }

        if (relSelect === 'count') {
          result[alias] = [{ count: related.length }]
        } else if (relSelect === '*') {
          // For nested select like "modules(*, courses(*))"
          result[alias] = related
        } else {
          result[alias] = related
        }
        continue
      }

      // Handle nested wildcard: "*, table(*)"
      // Simple column
      result[part] = row[part]
    }

    return result
  }
}

// ---------- Storage ----------
class FakeStorageBucket {
  private _bucket: string

  constructor(bucket: string) {
    this._bucket = bucket
  }

  async upload(path: string, _file: any) {
    const url = `https://fake-storage.supabase.co/storage/v1/object/public/${this._bucket}/${path}`
    return { data: { path, fullPath: `${this._bucket}/${path}` }, error: null }
  }

  async remove(paths: string[]) {
    return { data: paths.map((p) => ({ name: p })), error: null }
  }

  async list(prefix?: string) {
    return { data: [], error: null }
  }

  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `https://fake-storage.supabase.co/storage/v1/object/public/${this._bucket}/${path}`,
      },
    }
  }
}

class FakeStorage {
  from(bucket: string) {
    return new FakeStorageBucket(bucket)
  }
}

// ---------- Realtime channel ----------
class FakeChannel {
  private _table: string | null = null
  private _event: string = '*'
  private _callback: RealtimeCallback | null = null
  private _unsubscribe: (() => void) | null = null

  on(event: string, config: any, callback?: RealtimeCallback) {
    if (typeof config === 'object' && config.table) {
      this._table = config.table
    }
    if (callback) {
      this._callback = callback
    } else if (typeof config === 'function') {
      this._callback = config
    }
    return this
  }

  subscribe(callback?: (status: string) => void) {
    if (this._table && this._callback) {
      this._unsubscribe = addRealtimeSubscription(this._table, this._callback)
    }
    if (callback) callback('SUBSCRIBED')
    return this
  }

  unsubscribe() {
    if (this._unsubscribe) this._unsubscribe()
    return this
  }
}

// ---------- Auth ----------
class FakeAuth {
  async getUser() {
    const userId = getStoredSession()
    if (!userId) {
      return { data: { user: null }, error: null }
    }
    const store = getStore()
    const user = store.users.find((u) => u.id === userId) || null
    return { data: { user }, error: null }
  }

  async getSession() {
    const userId = getStoredSession()
    if (!userId) {
      return { data: { session: null }, error: null }
    }
    const store = getStore()
    const user = store.users.find((u) => u.id === userId) || null
    if (!user) return { data: { session: null }, error: null }
    return {
      data: {
        session: {
          user,
          access_token: 'fake-token',
          refresh_token: 'fake-token',
        },
      },
      error: null,
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const store = getStore()
    const storedPassword = store.passwords[email]
    if (!storedPassword || storedPassword !== password) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      }
    }
    const user = store.users.find((u) => u.email === email)
    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      }
    }

    setStoredSession(user.id)
    notifyAuthListeners('SIGNED_IN', user)

    return {
      data: {
        user,
        session: { user, access_token: 'fake-token', refresh_token: 'fake-token' },
      },
      error: null,
    }
  }

  async signUp({
    email,
    password,
    options,
  }: {
    email: string
    password: string
    options?: { emailRedirectTo?: string; data?: Record<string, any> }
  }) {
    const store = getStore()
    const existing = store.users.find((u) => u.email === email)
    if (existing) {
      return {
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 400 },
      }
    }

    const now = new Date().toISOString()
    const newUser: FakeUser = {
      id: generateId(),
      email,
      user_metadata: options?.data || {},
      app_metadata: { provider: 'email' },
      created_at: now,
      aud: 'authenticated',
      role: 'authenticated',
    }

    store.users.push(newUser)
    store.passwords[email] = password

    // Auto-create profile (simulates Supabase trigger)
    const profile = {
      id: newUser.id,
      email,
      full_name: (options?.data?.full_name as string) || null,
      role: 'student' as const,
      avatar_url: null,
      created_at: now,
      updated_at: now,
    }
    store.profiles.push(profile)

    saveStore()

    // Auto sign-in after register (skip email confirmation in sim mode)
    setStoredSession(newUser.id)
    notifyAuthListeners('SIGNED_IN', newUser)

    return {
      data: {
        user: newUser,
        session: { user: newUser, access_token: 'fake-token', refresh_token: 'fake-token' },
      },
      error: null,
    }
  }

  async signOut() {
    setStoredSession(null)
    notifyAuthListeners('SIGNED_OUT', null)
    return { error: null }
  }

  async resetPasswordForEmail(_email: string, _options?: any) {
    // Simulate success
    return { data: {}, error: null }
  }

  async updateUser(updates: { password?: string; data?: Record<string, any> }) {
    const userId = getStoredSession()
    if (!userId) return { data: { user: null }, error: { message: 'Not authenticated' } }
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)
    if (!user) return { data: { user: null }, error: { message: 'Not authenticated' } }

    if (updates.password) {
      store.passwords[user.email] = updates.password
    }
    if (updates.data) {
      user.user_metadata = { ...user.user_metadata, ...updates.data }
    }
    saveStore()
    return { data: { user }, error: null }
  }

  onAuthStateChange(callback: AuthListener) {
    _authListeners.add(callback)

    // Fire initial event if already logged in
    const userId = getStoredSession()
    if (userId) {
      const store = getStore()
      const user = store.users.find((u) => u.id === userId) || null
      if (user) {
        setTimeout(() => {
          callback('INITIAL_SESSION', { user } as any)
        }, 0)
      }
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            _authListeners.delete(callback)
          },
        },
      },
    }
  }
}

// ---------- Main Client ----------
export class FakeSupabaseClient {
  auth = new FakeAuth()
  storage = new FakeStorage()

  from(table: string) {
    return new FakeQueryBuilder(table)
  }

  channel(name: string) {
    return new FakeChannel()
  }

  removeChannel(_channel: any) {
    // no-op
  }
}

// Singleton
let _clientInstance: FakeSupabaseClient | null = null

export function createFakeClient(): FakeSupabaseClient {
  if (!_clientInstance) {
    _clientInstance = new FakeSupabaseClient()
  }
  return _clientInstance
}
