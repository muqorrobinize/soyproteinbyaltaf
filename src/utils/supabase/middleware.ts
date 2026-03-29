import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const pathname = request.nextUrl.pathname

  // Routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/redeem']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Routes that should redirect to dashboard if already logged in (auth gateway)
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in → protect routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    
    const response = NextResponse.redirect(url)
    // IMPORTANT: Transfer cookies from the supabaseResponse we've been building
    supabaseResponse.cookies.getAll().forEach((c) => response.cookies.set(c.name, c.value, c))
    return response
  }

  // Already logged in → bounce off auth pages to dashboard  
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => response.cookies.set(c.name, c.value, c))
    return response
  }

  return supabaseResponse
}
