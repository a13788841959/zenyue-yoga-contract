'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { BRAND } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function NewContractPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerIdCard: '',
    customerWechat: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.customerIdCard.trim()) {
      setError('姓名、手机号和身份证号为必填项')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '创建失败')
      router.push(`/admin/contracts/${json.data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-gray-500 tap-target flex items-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-900">新建合同</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 max-w-lg mx-auto space-y-4 pb-28">
        {/* Course preview */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
          <p className="text-xs text-brand-600 font-medium mb-2">课程信息（固定）</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">课程名称</span>
              <span className="font-medium">{BRAND.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">课程节数</span>
              <span className="font-medium">{BRAND.sessions} 节</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">课程金额</span>
              <span className="font-bold text-brand-600">{formatCurrency(BRAND.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">有效期</span>
              <span className="font-medium">签约日起12个月</span>
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="font-semibold text-gray-700 text-sm">学员信息</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { name: 'customerName',    label: '姓名',          type: 'text',          required: true,  placeholder: '请输入真实姓名' },
              { name: 'customerPhone',   label: '手机号码',      type: 'tel',           required: true,  placeholder: '请输入手机号' },
              { name: 'customerIdCard',  label: '身份证号码',    type: 'text',          required: true,  placeholder: '请输入18位身份证号' },
              { name: 'customerWechat',  label: '微信号',        type: 'text',          required: false, placeholder: '请输入微信号（选填）' },
              { name: 'emergencyContact',label: '紧急联系人',    type: 'text',          required: false, placeholder: '紧急联系人姓名（选填）' },
              { name: 'emergencyPhone',  label: '紧急联系电话',  type: 'tel',           required: false, placeholder: '紧急联系人电话（选填）' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-600 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            ))}

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">备注</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="其他备注信息（选填）"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-3 rounded-xl">
            {error}
          </p>
        )}
      </form>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button fullWidth size="lg" loading={loading} onClick={handleSubmit as () => void}>
          {loading ? '创建中…' : '✅ 创建合同并生成分享链接'}
        </Button>
      </div>
    </div>
  )
}
