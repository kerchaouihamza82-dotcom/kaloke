import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Admin client bypasses RLS — used for role/access checks only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isProtectedRoute) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (!pathname.startsWith('/admin')) {
      // Use admin client to bypass RLS and get fresh data
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Admin always has access
      if (profile?.role === 'admin') {
        return supabaseResponse
      }

      // Check paid access in user_profiles (column is user_id, not id)
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('has_access')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!userProfile?.has_access) {
        return NextResponse.redirect(new URL('/inscribete', request.url))
      }
    }
  }

  if (isAuthRoute && user) {
    const hasPlanParam = request.nextUrl.searchParams.has('plan')
    if (!hasPlanParam) {
      // Use admin client to bypass RLS
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      const { data: userProfile2 } = await supabaseAdmin
        .from('user_profiles')
        .select('has_access')
        .eq('user_id', user.id)
        .maybeSingle()

      if (userProfile2?.has_access) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
