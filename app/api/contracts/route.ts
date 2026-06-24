import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateContractNo, addMonths } from '@/lib/utils'
import { CreateContractRequest, ApiResponse, BRAND } from '@/types'
import { z } from 'zod'

const createSchema = z.object({
  customerName:     z.string().min(1, '姓名不能为空'),
  customerPhone:    z.string().min(7, '手机号格式不正确'),
  customerIdCard:   z.string().min(15, '身份证号不正确'),
  customerWechat:   z.string().optional().default(''),
  emergencyContact: z.string().optional().default(''),
  emergencyPhone:   z.string().optional().default(''),
  notes:            z.string().optional().default(''),
})

// POST /api/contracts – create a new contract
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateContractRequest
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const now = new Date()
    const expireDate = addMonths(now, BRAND.validityMonths)

    // Ensure unique contract number
    let contractNo = generateContractNo()
    let exists = await prisma.contract.findUnique({ where: { contractNo } })
    while (exists) {
      contractNo = generateContractNo()
      exists = await prisma.contract.findUnique({ where: { contractNo } })
    }

    const contract = await prisma.contract.create({
      data: {
        contractNo,
        customerName:     data.customerName,
        customerPhone:    data.customerPhone,
        customerIdCard:   data.customerIdCard,
        customerWechat:   data.customerWechat ?? '',
        emergencyContact: data.emergencyContact ?? '',
        emergencyPhone:   data.emergencyPhone ?? '',
        notes:            data.notes ?? '',
        courseName:       BRAND.courseName,
        courseSessions:   BRAND.sessions,
        courseAmount:     BRAND.amount,
        purchaseDate:     now,
        expireDate,
        status:           'PENDING',
      },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: contract }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/contracts]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: '服务器错误，请重试' }, { status: 500 })
  }
}

// GET /api/contracts – list all contracts (admin only, simple)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as 'PENDING' | 'SIGNED' | 'EXPIRED' | 'CANCELLED' | null
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { contracts, total, page, limit },
    })
  } catch (err) {
    console.error('[GET /api/contracts]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
