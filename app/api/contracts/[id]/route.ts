import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/contracts/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const contract = await prisma.contract.findUnique({ where: { id } })
    if (!contract) {
      return NextResponse.json<ApiResponse>({ success: false, error: '合同不存在' }, { status: 404 })
    }
    return NextResponse.json<ApiResponse>({ success: true, data: contract })
  } catch (err) {
    console.error('[GET /api/contracts/[id]]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// PATCH /api/contracts/[id] – update status or notes
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, notes, staffSignatureUrl } = body

    const allowedStatuses = ['PENDING', 'SIGNED', 'EXPIRED', 'CANCELLED']
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json<ApiResponse>({ success: false, error: '无效的状态值' }, { status: 400 })
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(staffSignatureUrl !== undefined ? { staffSignatureUrl } : {}),
      },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: updated })
  } catch (err) {
    console.error('[PATCH /api/contracts/[id]]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
