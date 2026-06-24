import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, ADMIN_COOKIE, verifyAdminToken } from '@/lib/utils'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'ZenYue@2025'

// POST /api/auth/admin  →  login
export async function POST(req: NextRequest) {
  try {
    // Support logout via query param
    const { searchParams } = new URL(req.url)
    if (searchParams.get('logout') === '1') {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete(ADMIN_COOKIE)
      return res
    }

    const body = await req.json()
    const { password } = body

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 })
    }

    const token = createAdminToken()
    const res = NextResponse.json({ success: true })
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[POST /api/auth/admin]', err)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// GET /api/auth/admin?logout=1  →  logout redirect
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('logout') === '1') {
    const res = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.delete(ADMIN_COOKIE)
    return res
  }

  // Check auth status
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  const valid = token ? verifyAdminToken(token) : false
  return NextResponse.json({ authenticated: valid })
}
