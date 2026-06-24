import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase (service role – only import in server components / API routes)
export function createServerSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(supabaseUrl, serviceKey)
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  signatures: 'signatures',   // 签名图片
  idCards: 'id-cards',        // 身份证照片
} as const

/**
 * Upload a base64 data URL or Blob to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  data: string | Blob,       // base64 data URL or Blob
  contentType = 'image/png'
): Promise<string> {
  const sb = createServerSupabase()

  let fileData: Buffer | Blob
  if (typeof data === 'string') {
    const base64 = data.split(',')[1] ?? data
    fileData = Buffer.from(base64, 'base64')
  } else {
    fileData = data
  }

  const { error } = await sb.storage
    .from(bucket)
    .upload(path, fileData, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path)
  return urlData.publicUrl
}
