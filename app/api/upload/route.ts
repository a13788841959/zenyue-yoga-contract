import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, STORAGE_BUCKETS } from '@/lib/supabase'
import { ApiResponse } from '@/types'

// POST /api/upload
// Body: FormData { file: File, bucket: 'signatures'|'id-cards', path: string }
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string | null) ?? STORAGE_BUCKETS.signatures
    const customPath = formData.get('path') as string | null

    if (!file) {
      return NextResponse.json<ApiResponse>({ success: false, error: '未收到文件' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'png'
    const path = customPath ?? `uploads/${Date.now()}.${ext}`
    const contentType = file.type || 'image/png'

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate bucket
    const allowedBuckets = Object.values(STORAGE_BUCKETS)
    if (!allowedBuckets.includes(bucket as typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS])) {
      return NextResponse.json<ApiResponse>({ success: false, error: '无效的存储桶' }, { status: 400 })
    }

    const url = await uploadFile(bucket, path, buffer as unknown as string, contentType)

    return NextResponse.json<ApiResponse>({ success: true, data: { url, path } })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: '上传失败，请重试' }, { status: 500 })
  }
}
