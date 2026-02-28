import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/admin')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  // Protect dashboard/profile/admin routes
  if (isProtectedRoute) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has paid access OR is admin
    if (!pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, has_access')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role === 'admin'
      const hasAccess = profile?.has_access === true

      if (!isAdmin && !hasAccess) {
        // Also check user_profiles table as fallback
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('has_access')
          .eq('id', user.id)
          .single()

        if (!userProfile?.has_access) {
          return NextResponse.redirect(new URL('/inscribete', request.url))
        }
      }
    }
  }

  // Redirect authenticated users with access away from login/register
  // But allow if they have a plan param (they need to complete checkout)
  if (isAuthRoute && user) {
    const hasPlanParam = request.nextUrl.searchParams.has('plan')
    if (!hasPlanParam) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, has_access')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role === 'admin'

      if (isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Also check user_profiles for paid access
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('has_access')
        .eq('id', user.id)
        .single()

      if (profile?.has_access || userProfile?.has_access) {
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
