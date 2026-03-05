'use server'

import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function createModule(cursoId: string, titulo: string, ordenIndex: number) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('modulos')
    .insert([{ curso_id: cursoId, titulo, orden_index: ordenIndex }])
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateModule(id: string, titulo: string) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('modulos')
    .update({ titulo })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteModule(id: string) {
  const supabase = getAdminClient()
  // Delete sesiones first (cascade might not be set)
  await supabase.from('sesiones').delete().eq('modulos_id', id)
  const { error } = await supabase.from('modulos').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function createSesion(modulosId: string, titulo: string, videoUrl: string, ordenIndex: number) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('sesiones')
    .insert([{ modulos_id: modulosId, titulo, video_url: videoUrl, orden_index: ordenIndex }])
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateSesion(id: string, titulo: string, videoUrl: string) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('sesiones')
    .update({ titulo, video_url: videoUrl })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteSesion(id: string) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('sesiones').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function createCourse(data: {
  titulo: string
  descripcion: string
  instructor: string
  categoria: string
  url_del_curso?: string
  imagen_url?: string
}) {
  const supabase = getAdminClient()
  const { data: result, error } = await supabase
    .from('cursos')
    .insert([{ ...data, fecha_creacion: new Date().toISOString() }])
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: result }
}

export async function updateCourse(id: string, data: Record<string, any>) {
  const supabase = getAdminClient()
  const { data: result, error } = await supabase
    .from('cursos')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: result }
}

export async function deleteCourse(id: string) {
  const supabase = getAdminClient()
  // Delete sesiones of all modules first
  const { data: modulos } = await supabase.from('modulos').select('id').eq('curso_id', id)
  if (modulos) {
    for (const m of modulos) {
      await supabase.from('sesiones').delete().eq('modulos_id', m.id)
    }
  }
  await supabase.from('modulos').delete().eq('curso_id', id)
  const { error } = await supabase.from('cursos').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
