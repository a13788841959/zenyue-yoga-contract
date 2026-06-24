'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ContractDocument from '@/components/ContractDocument'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ContractData } from '@/types'
import { formatDateTime, contractShareUrl, maskIdCard, maskPhone } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminContractDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [contract, setContract] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'contract' | 'info' | 'files'>('contract')

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => r.json())
      .then((j) => {
        setContract(j.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function handleCopyLink() {
    if (!contract) return
    const url = contractShareUrl(contract.id)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleCancel() {
    if (!confirm('确认取消该合同？取消后学员无法签署。')) return
    setCancelLoading(true)
    await fetch(`/api/contracts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
    router.refresh()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中…</div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">😕</p>
          <p>合同不存在</p>
          <Link href="/admin" className="text-brand-500 text-sm mt-2 block">返回后台</Link>
        </div>
      </div>
    )
  }

  const shareUrl = contractShareUrl(contract.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/admin" className="text-gray-500 tap-target flex items-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{contract.contractNo}</p>
          <p className="font-semibold text-gray-900 text-sm">{contract.customerName}</p>
        </div>
        <Badge status={contract.status} />
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 flex">
        {(['contract', 'info', 'files'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-gray-400'
            }`}
          >
            {{ contract: '合同预览', info: '学员信息', files: '签名/证件' }[tab]}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto pb-36">
        {/* ── Tab: Contract preview ── */}
        {activeTab === 'contract' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ContractDocument
              contract={contract}
              showSignatureArea={true}
              staffSignatureUrl={contract.staffSignatureUrl}
              customerSignatureUrl={contract.signatureUrl}
            />
          </div>
        )}

        {/* ── Tab: Customer info ── */}
        {activeTab === 'info' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="font-semibold text-gray-700 text-sm">学员信息</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  ['姓名', contract.customerName],
                  ['手机号', maskPhone(contract.customerPhone)],
                  ['身份证号', maskIdCard(contract.customerIdCard)],
                  ['微信号', contract.customerWechat || '—'],
                  ['紧急联系人', contract.emergencyContact || '—'],
                  ['紧急联系电话', contract.emergencyPhone || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="font-semibold text-gray-700 text-sm">签署记录</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  ['签署状态', { PENDING: '待签署', SIGNED: '已签署', EXPIRED: '已过期', CANCELLED: '已取消' }[contract.status]],
                  ['签署时间', formatDateTime(contract.signedAt)],
                  ['签署IP', contract.signIp || '—'],
                  ['创建时间', formatDateTime(contract.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {contract.notes && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">备注</p>
                <p className="text-sm text-gray-700">{contract.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Files ── */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            {/* Customer signature */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">乙方签名</p>
              {contract.signatureUrl ? (
                <div className="relative h-28 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={contract.signatureUrl}
                    alt="乙方签名"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="h-28 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                  暂未签署
                </div>
              )}
            </div>

            {/* ID card */}
            {(contract.idCardFrontUrl || contract.idCardBackUrl) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3">身份证照片</p>
                <div className="grid grid-cols-2 gap-3">
                  {contract.idCardFrontUrl && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">正面</p>
                      <div className="relative h-28 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <Image
                          src={contract.idCardFrontUrl}
                          alt="身份证正面"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {contract.idCardBackUrl && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">背面</p>
                      <div className="relative h-28 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <Image
                          src={contract.idCardBackUrl}
                          alt="身份证背面"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!contract.signatureUrl && !contract.idCardFrontUrl && !contract.idCardBackUrl && (
              <div className="text-center text-gray-400 py-12">
                <p className="text-3xl mb-2">📂</p>
                <p className="text-sm">暂无文件</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
        {contract.status === 'PENDING' && (
          <>
            {/* Share link */}
            <Button variant="outline" fullWidth onClick={handleCopyLink}>
              {copied ? '✅ 链接已复制！' : '🔗 复制签署链接发给学员'}
            </Button>
            {/* WeChat share hint */}
            <p className="text-xs text-gray-400 text-center truncate">
              {shareUrl}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/contract/${contract.id}`}
                target="_blank"
                className="flex-1 text-center text-sm bg-gray-100 text-gray-700 py-3 rounded-xl font-medium active:bg-gray-200"
              >
                预览合同
              </Link>
              <Link
                href={`/contract/${contract.id}/print`}
                target="_blank"
                className="flex-1 text-center text-sm bg-gray-100 text-gray-700 py-3 rounded-xl font-medium active:bg-gray-200"
              >
                打印合同
              </Link>
              <Button variant="danger" size="sm" loading={cancelLoading} onClick={handleCancel} className="flex-1">
                取消合同
              </Button>
            </div>
          </>
        )}

        {contract.status === 'SIGNED' && (
          <div className="flex gap-2">
            <Link
              href={`/contract/${contract.id}`}
              target="_blank"
              className="flex-1 text-center text-sm bg-brand-50 text-brand-700 border border-brand-200 py-3 rounded-xl font-medium"
            >
              查看合同
            </Link>
            <Link
              href={`/contract/${contract.id}/print`}
              target="_blank"
              className="flex-1 text-center text-sm bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
            >
              打印 / PDF
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
