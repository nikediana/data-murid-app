import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
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

  // Rule 1: Selalu izinkan akses tanpa cek login
  const alwaysPublic = ['/lupa-password', '/reset-password', '/auth/callback']
    if (alwaysPublic.includes(pathname)) {
    return supabaseResponse
  }

  // Rule 2: Belum login
  if (!user) {
    // Sedang di /login → tetap di sini
    if (pathname === '/login') {
      return supabaseResponse
    }
    // Selain itu → redirect ke /login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Rule 3: Sudah login
  // Membuka /login → redirect ke /dashboard
  if (pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Selain itu → izinkan akses
  return supabaseResponse
}