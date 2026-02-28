'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log('[v0] DEBUG:', msg)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])
  }

  const runDiagnostic = async () => {
    setLogs([])
    const supabase = createClient()

    // Step 1: Check Supabase URL
    addLog(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}`)

    // Step 2: Auth
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr) {
      addLog(`AUTH ERROR: ${authErr.message}`)
      return
    }
    if (!user) {
      addLog('NO USER LOGGED IN - you need to be logged in')
      return
    }
    addLog(`User: ${user.email} (${user.id})`)

    // Step 3: Read profiles
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single()
    if (profileErr) {
      addLog(`PROFILE READ ERROR: ${profileErr.message} | code: ${profileErr.code} | details: ${profileErr.details}`)
    } else {
      addLog(`Profile: email=${profile.email}, role=${profile.role}`)
    }

    // Step 4: Read cursos
    const { data: cursos, error: cursosErr } = await supabase.from('cursos').select('id, titulo').limit(3)
    if (cursosErr) {
      addLog(`CURSOS READ ERROR: ${cursosErr.message}`)
      return
    }
    addLog(`Cursos found: ${cursos.length} - ${cursos.map(c => c.titulo).join(', ')}`)

    if (cursos.length === 0) {
      addLog('No courses found, cannot test module insert')
      return
    }

    const testCursoId = cursos[0].id
    addLog(`Testing insert on curso: ${testCursoId}`)

    // Step 5: Try INSERT module
    const insertData = {
      curso_id: testCursoId,
      titulo: 'TEST_MODULE_DELETE_ME',
      orden_index: 999,
    }
    addLog(`Inserting: ${JSON.stringify(insertData)}`)

    const { data: insertResult, error: insertErr } = await supabase
      .from('modulos')
      .insert([insertData])
      .select()

    if (insertErr) {
      addLog(`INSERT MODULE ERROR: message="${insertErr.message}" code="${insertErr.code}" details="${insertErr.details}" hint="${insertErr.hint}"`)
    } else {
      addLog(`INSERT SUCCESS: ${JSON.stringify(insertResult)}`)
      // Clean up
      if (insertResult && insertResult[0]) {
        const { error: delErr } = await supabase.from('modulos').delete().eq('id', insertResult[0].id)
        addLog(delErr ? `Cleanup failed: ${delErr.message}` : 'Cleanup: test module deleted')
      }
    }

    // Step 6: Try INSERT via fetch to API route
    addLog('--- Testing API route ---')
    try {
      const resp = await fetch('/api/admin/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'insert', table: 'modulos', data: insertData }),
      })
      const body = await resp.json()
      addLog(`API route response: status=${resp.status} body=${JSON.stringify(body)}`)

      // Clean up API insert
      if (body.data && body.data[0]) {
        await fetch('/api/admin/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', table: 'modulos', id: body.data[0].id }),
        })
        addLog('Cleanup: API test module deleted')
      }
    } catch (fetchErr: any) {
      addLog(`API FETCH ERROR: ${fetchErr.message}`)
    }

    addLog('--- DIAGNOSTIC COMPLETE ---')
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Diagnostic Page</h1>
      <Button onClick={runDiagnostic} className="mb-4">Run Full Diagnostic</Button>
      <div className="space-y-1 rounded-lg bg-black p-4 font-mono text-sm text-green-400">
        {logs.length === 0 && <p className="text-gray-500">Click the button to start...</p>}
        {logs.map((log, i) => (
          <p key={i} className={log.includes('ERROR') ? 'text-red-400' : ''}>{log}</p>
        ))}
      </div>
    </div>
  )
}
