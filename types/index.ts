import { ContractStatus } from '@prisma/client'

// Re-export for convenience
export { ContractStatus }

// ────────────────────────────────────────────
// Contract type (Prisma result shape)
// ────────────────────────────────────────────
export interface ContractData {
  id: string
  contractNo: string
  status: ContractStatus

  customerName: string
  customerPhone: string
  customerIdCard: string
  customerWechat: string
  emergencyContact: string
  emergencyPhone: string

  courseName: string
  courseSessions: number
  courseAmount: { toString(): string } | number | string
  purchaseDate: Date | string
  expireDate: Date | string

  signedAt: Date | string | null
  signIp: string | null
  signUserAgent: string | null

  signatureUrl: string | null
  staffSignatureUrl: string | null
  idCardFrontUrl: string | null
  idCardBackUrl: string | null

  notes: string | null

  createdAt: Date | string
  updatedAt: Date | string
}

// ────────────────────────────────────────────
// API request / response types
// ────────────────────────────────────────────
export interface CreateContractRequest {
  customerName: string
  customerPhone: string
  customerIdCard: string
  customerWechat?: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
}

export interface SignContractRequest {
  signatureData: string    // base64 PNG data URL
  idCardFrontData?: string // optional base64
  idCardBackData?: string  // optional base64
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ────────────────────────────────────────────
// Status display helpers
// ────────────────────────────────────────────
export const STATUS_LABEL: Record<ContractStatus, string> = {
  PENDING:   '待签署',
  SIGNED:    '已签署',
  EXPIRED:   '已过期',
  CANCELLED: '已取消',
}

export const STATUS_COLOR: Record<ContractStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  SIGNED:    'bg-green-100 text-green-800',
  EXPIRED:   'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-100 text-red-700',
}

// ────────────────────────────────────────────
// Business constants
// ────────────────────────────────────────────
export const BRAND = {
  name: '禅悦国际瑜伽',
  courseName: '身材管理私教定制课程',
  courseType: '1对1私教课程',
  sessions: 50,
  amount: 9680,
  validityMonths: 12,
  address: '龙溪大道144号禅悦瑜伽4楼',
  phone: '',  // 填写门店电话
}
