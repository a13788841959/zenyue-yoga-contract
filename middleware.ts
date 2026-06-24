import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'zy_admin_token'
const ADMIN_PATHS = ['/admin']
const PUBLIC_ADMIN = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isPublicAdmin = PUBLIC_ADMIN.some((p) => pathname.startsWith(p))

  if (isAdminPath && !isPublicAdmin) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value
    if (!token || !isValidToken(token)) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

function isValidToken(token: string): boolean {
  try {
    const [payload, _sig] = token.split('.')
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    // 24 hour expiry
    return decoded.exp && decoded.exp > Date.now()
  } catch {
    return false
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
