import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

// ────────────────────────────────────────────
// Contract Number Generator
// Format: ZY-YYYYMMDD-XXXX  (4-digit random)
// ────────────────────────────────────────────
export function generateContractNo(): string {
  const date = dayjs().format('YYYYMMDD')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `ZY-${date}-${rand}`
}

// ────────────────────────────────────────────
// Date helpers
// ────────────────────────────────────────────
export function addMonths(date: Date, months: number): Date {
  return dayjs(date).add(months, 'month').toDate()
}

export function formatDate(date: Date | string | null | undefined, fmt = 'YYYY年MM月DD日'): string {
  if (!date) return '—'
  return dayjs(date).format(fmt)
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// ────────────────────────────────────────────
// Currency
// ────────────────────────────────────────────
export function formatCurrency(amount: number | string | { toString(): string }): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString())
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(num)
}

// ────────────────────────────────────────────
// Admin Auth Token (simple HMAC-less JWT-like)
// ────────────────────────────────────────────
const ADMIN_COOKIE = 'zy_admin_token'

export function createAdminToken(): string {
  const payload = {
    sub: 'admin',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
    jti: uuidv4(),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.signed`
}

export function verifyAdminToken(token: string): boolean {
  try {
    const [payload] = token.split('.')
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return decoded.exp > Date.now()
  } catch {
    return false
  }
}

export { ADMIN_COOKIE }

// ────────────────────────────────────────────
// Class name merge helper
// ────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ────────────────────────────────────────────
// Phone number masking  138****8888
// ────────────────────────────────────────────
export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// ────────────────────────────────────────────
// ID card masking  110***********1234
// ────────────────────────────────────────────
export function maskIdCard(id: string): string {
  if (id.length < 8) return id
  return id.slice(0, 3) + '***********' + id.slice(-4)
}

// ────────────────────────────────────────────
// Contract share URL
// ────────────────────────────────────────────
export function contractShareUrl(id: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return `${base}/contract/${id}`
}
