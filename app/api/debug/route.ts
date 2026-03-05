import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function GET() {
  const results: Record<string, any> = {}

  // 1. Verificar env vars
  results.env = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...` : 'MISSING',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  }

  // 2. Verificar Stripe
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const prices = await stripe.prices.list({ limit: 2, active: true })
    results.stripe = {
      status: 'OK',
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST',
      pricesFound: prices.data.length,
      priceIds: prices.data.map(p => p.id),
    }
  } catch (e: any) {
    results.stripe = { status: 'ERROR', message: e.message }
  }

  // 3. Verificar Supabase Auth (sesión del usuario actual)
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    results.auth = {
      status: error ? 'ERROR' : (user ? 'LOGGED_IN' : 'NOT_LOGGED_IN'),
      userId: user?.id?.substring(0, 8) || null,
      email: user?.email || null,
      error: error?.message || null,
    }
  } catch (e: any) {
    results.auth = { status: 'EXCEPTION', message: e.message }
  }

  // 4. Verificar Supabase Admin y tabla user_profiles
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await admin.from('user_profiles').select('user_id, stripe_customer_id, has_access').limit(5)
    results.db = {
      status: error ? 'ERROR' : 'OK',
      userProfilesCount: data?.length || 0,
      sample: data?.map(r => ({ 
        userId: r.user_id?.substring(0, 8), 
        hasCustomer: !!r.stripe_customer_id,
        hasAccess: r.has_access 
      })),
      error: error?.message || null,
    }
  } catch (e: any) {
    results.db = { status: 'EXCEPTION', message: e.message }
  }

  // 5. Verificar que el price ID existe en Stripe
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const price = await stripe.prices.retrieve('price_1T7cBgGXPveWbaAfVlivnMcG')
    results.priceCheck = {
      status: 'OK',
      priceId: price.id,
      active: price.active,
      amount: price.unit_amount,
      currency: price.currency,
    }
  } catch (e: any) {
    results.priceCheck = { status: 'ERROR', message: e.message }
  }

  return NextResponse.json(results, { status: 200 })
}
