'use client'

import { use, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import SignatureCanvas, { SignatureCanvasHandle } from '@/components/SignatureCanvas'
import Button from '@/components/ui/Button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SignPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const customerSigRef = useRef<SignatureCanvasHandle>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'sign' | 'id-upload'>('sign')

  // ID card photo previews
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null)
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null)
  const [idFrontData, setIdFrontData] = useState<string | null>(null)
  const [idBackData, setIdBackData] = useState<string | null>(null)

  // ── Signature step ──
  function handleClearSig() {
    customerSigRef.current?.clear()
  }

  function handleNextToIdUpload() {
    if (customerSigRef.current?.isEmpty()) {
      setError('请先完成手写签名')
      return
    }
    setError('')
    setStep('id-upload')
  }

  // ── ID card upload ──
  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (side === 'front') {
        setIdFrontPreview(result)
        setIdFrontData(result)
      } else {
        setIdBackPreview(result)
        setIdBackData(result)
      }
    }
    reader.readAsDataURL(file)
  }

  // ── Submit ──
  async function handleSubmit() {
    if (customerSigRef.current?.isEmpty()) {
      setError('请先完成手写签名')
      setStep('sign')
      return
    }
    setLoading(true)
    setError('')
    try {
      const signatureData = customerSigRef.current!.toDataURL('image/png')
      const res = await fetch(`/api/contracts/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureData,
          idCardFrontData: idFrontData ?? undefined,
          idCardBackData: idBackData ?? undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '签署失败，请重试')
      router.push(`/contract/${id}/complete`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '签署失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step === 'id-upload' ? setStep('sign') : router.back()}
          className="text-gray-500 tap-target flex items-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="font-semibold text-gray-900">
            {step === 'sign' ? '手写签名' : '上传身份证'}
          </p>
          <p className="text-xs text-gray-400">
            {step === 'sign' ? '步骤 1 / 2' : '步骤 2 / 2'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: step === 'sign' ? '50%' : '100%' }}
        />
      </div>

      <div className="flex-1 p-4 pb-24">
        {/* ── Step 1: Signature ── */}
        {step === 'sign' && (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800 font-medium">
                ✋ 请在下方空白区域用手指书写您的姓名作为电子签名
              </p>
              <p className="text-xs text-amber-600 mt-1">
                签名即代表您已阅读并同意合同全部条款
              </p>
            </div>

            {/* Canvas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">乙方（会员）签名</p>
                <button
                  onClick={handleClearSig}
                  className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1 active:bg-gray-100"
                >
                  清除重写
                </button>
              </div>
              <div className="h-48 rounded-xl overflow-hidden">
                <SignatureCanvas ref={customerSigRef} />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-3">{error}</p>
            )}
          </div>
        )}

        {/* ── Step 2: ID upload ── */}
        {step === 'id-upload' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800 font-medium">
                📷 请上传身份证照片（可选）
              </p>
              <p className="text-xs text-blue-600 mt-1">
                上传身份证有助于核实身份，也可跳过直接提交
              </p>
            </div>

            {/* Front */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">身份证正面（人像面）</p>
              <label className="block">
                {idFrontPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-brand-300">
                    <Image src={idFrontPreview} alt="身份证正面" fill className="object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                      <span className="text-white text-sm opacity-0 hover:opacity-100 bg-black/50 px-3 py-1 rounded-lg">
                        点击更换
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 active:bg-gray-100">
                    <span className="text-3xl">🪪</span>
                    <span className="text-sm text-gray-500">点击拍照或选择图片</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'front')}
                />
              </label>
            </div>

            {/* Back */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">身份证背面（国徽面）</p>
              <label className="block">
                {idBackPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-brand-300">
                    <Image src={idBackPreview} alt="身份证背面" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 active:bg-gray-100">
                    <span className="text-3xl">🪪</span>
                    <span className="text-sm text-gray-500">点击拍照或选择图片</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'back')}
                />
              </label>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {step === 'sign' ? (
          <Button fullWidth size="lg" onClick={handleNextToIdUpload}>
            下一步：上传身份证
          </Button>
        ) : (
          <div className="space-y-2">
            <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
              {loading ? '提交中…' : '✅ 确认签署合同'}
            </Button>
            {!loading && (
              <button
                onClick={handleSubmit}
                className="w-full text-center text-sm text-gray-400 py-1"
              >
                跳过身份证直接提交
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
