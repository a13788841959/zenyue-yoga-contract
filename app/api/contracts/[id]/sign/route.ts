import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile, STORAGE_BUCKETS } from '@/lib/supabase'
import { ApiResponse, SignContractRequest } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST /api/contracts/[id]/sign
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params

    // Fetch contract
    const contract = await prisma.contract.findUnique({ where: { id } })
    if (!contract) {
      return NextResponse.json<ApiResponse>({ success: false, error: '合同不存在' }, { status: 404 })
    }
    if (contract.status === 'SIGNED') {
      return NextResponse.json<ApiResponse>({ success: false, error: '合同已签署，不可重复签署' }, { status: 409 })
    }
    if (contract.status === 'CANCELLED' || contract.status === 'EXPIRED') {
      return NextResponse.json<ApiResponse>({ success: false, error: '合同已取消或过期，无法签署' }, { status: 409 })
    }

    const body = await req.json() as SignContractRequest
    const { signatureData, idCardFrontData, idCardBackData } = body

    if (!signatureData) {
      return NextResponse.json<ApiResponse>({ success: false, error: '缺少签名数据' }, { status: 400 })
    }

    // Collect client info
    const forwarded = req.headers.get('x-forwarded-for')
    const signIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') ?? 'unknown'
    const signUserAgent = req.headers.get('user-agent') ?? ''
    const signedAt = new Date()

    // Upload signature to Supabase Storage
    const sigPath = `signatures/${id}/${signedAt.getTime()}.png`
    let signatureUrl: string | null = null
    let idCardFrontUrl: string | null = null
    let idCardBackUrl: string | null = null

    try {
      signatureUrl = await uploadFile(STORAGE_BUCKETS.signatures, sigPath, signatureData, 'image/png')
    } catch (uploadErr) {
      console.error('[sign] signature upload error:', uploadErr)
      // Store base64 fallback inline (≤1MB guard)
      signatureUrl = signatureData.length < 500_000 ? signatureData : null
    }

    if (idCardFrontData) {
      try {
        const frontPath = `id-cards/${id}/front_${signedAt.getTime()}.jpg`
        idCardFrontUrl = await uploadFile(STORAGE_BUCKETS.idCards, frontPath, idCardFrontData, 'image/jpeg')
      } catch (e) {
        console.warn('[sign] ID front upload error:', e)
        idCardFrontUrl = idCardFrontData.length < 500_000 ? idCardFrontData : null
      }
    }

    if (idCardBackData) {
      try {
        const backPath = `id-cards/${id}/back_${signedAt.getTime()}.jpg`
        idCardBackUrl = await uploadFile(STORAGE_BUCKETS.idCards, backPath, idCardBackData, 'image/jpeg')
      } catch (e) {
        console.warn('[sign] ID back upload error:', e)
        idCardBackUrl = idCardBackData.length < 500_000 ? idCardBackData : null
      }
    }

    // Update contract
    const updated = await prisma.contract.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signedAt,
        signIp,
        signUserAgent,
        signatureUrl,
        idCardFrontUrl,
        idCardBackUrl,
      },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: updated })
  } catch (err) {
    console.error('[POST /api/contracts/[id]/sign]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: '签署失败，请重试' }, { status: 500 })
  }
}
