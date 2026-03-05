// Diagnóstico completo: Stripe + Supabase + DB schema
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const { Client } = pg

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  console.log('\n========== STRIPE ==========')
  const key = process.env.STRIPE_SECRET_KEY ?? ''
  console.log('API Key modo:', key.startsWith('sk_live') ? '✅ LIVE' : '❌ TEST (' + key.substring(0,12) + '...)')

  try {
    const price1 = await stripe.prices.retrieve('price_1T7cBgGXPveWbaAfVlivnMcG')
    console.log('Price mensual:', price1.id, '|', price1.unit_amount/100, price1.currency, '| activo:', price1.active)
  } catch(e) { console.log('❌ Price mensual ERROR:', e.message) }

  try {
    const price2 = await stripe.prices.retrieve('price_1T7cE1GXPveWbaAfZHbjhuxj')
    console.log('Price anual:  ', price2.id, '|', price2.unit_amount/100, price2.currency, '| activo:', price2.active)
  } catch(e) { console.log('❌ Price anual ERROR:', e.message) }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: 'price_1T7cBgGXPveWbaAfVlivnMcG', quantity: 1 }],
      success_url: 'https://v0-digicashacademy.vercel.app/checkout/success',
      cancel_url: 'https://v0-digicashacademy.vercel.app/inscribete',
    })
    console.log('✅ Checkout session creada:', session.id)
    console.log('   URL:', session.url)
    // Limpiar
    await stripe.checkout.sessions.expire(session.id)
    console.log('   (session expirada/limpiada)')
  } catch(e) { console.log('❌ Checkout session ERROR:', e.message) }

  console.log('\n========== SUPABASE ENV ==========')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ?? '❌ FALTA')
  console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ presente' : '❌ FALTA')
  console.log('SERVICE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ presente' : '❌ FALTA')

  console.log('\n========== SUPABASE ADMIN ==========')
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
    if (error) throw error
    console.log('✅ Admin client OK | usuarios:', data.total_count)
  } catch(e) { console.log('❌ Admin client ERROR:', e.message) }

  console.log('\n========== DB TABLAS ==========')
  const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!connStr) { console.log('❌ POSTGRES_URL no configurada'); return }

  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    console.log('✅ Postgres conectado')

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `)
    console.log('Tablas:', tables.rows.map(r => r.table_name).join(', '))

    // Columnas user_profiles
    const cols1 = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_profiles' ORDER BY ordinal_position
    `)
    if (cols1.rows.length === 0) {
      console.log('❌ user_profiles NO EXISTE')
    } else {
      console.log('user_profiles columnas:', cols1.rows.map(r => r.column_name).join(', '))
    }

    // Columnas suscripciones
    const cols2 = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='suscripciones' ORDER BY ordinal_position
    `)
    if (cols2.rows.length === 0) {
      console.log('❌ suscripciones NO EXISTE')
    } else {
      console.log('suscripciones columnas:', cols2.rows.map(r => r.column_name).join(', '))
    }

    // Contar filas
    const cnt1 = await client.query(`SELECT COUNT(*) FROM public.user_profiles`)
    const cnt2 = await client.query(`SELECT COUNT(*) FROM public.suscripciones`)
    console.log('user_profiles filas:', cnt1.rows[0].count)
    console.log('suscripciones filas:', cnt2.rows[0].count)

  } catch(e) { console.log('❌ Postgres ERROR:', e.message) }
  finally { await client.end() }

  console.log('\n========== WEBHOOK SECRET ==========')
  const ws = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  console.log(ws ? '✅ STRIPE_WEBHOOK_SECRET presente: ' + ws.substring(0,10) + '...' : '❌ STRIPE_WEBHOOK_SECRET FALTA')
}

run().catch(console.error)
