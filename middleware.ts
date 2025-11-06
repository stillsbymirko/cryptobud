import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register')
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
                      req.nextUrl.pathname.startsWith('/transactions') ||
                      req.nextUrl.pathname.startsWith('/portfolio') ||
                      req.nextUrl.pathname.startsWith('/tax-calculator') ||
                      req.nextUrl.pathname.startsWith('/staking')

  if (isDashboard && !isAuth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
