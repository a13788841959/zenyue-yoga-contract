import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ContractDocument from '@/components/ContractDocument'
import Badge from '@/components/ui/Badge'
import { ContractData } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ContractViewPage({ params }: PageProps) {
  const { id } = await params
  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) notFound()

  const isPending = contract.status === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between no-print sticky top-0 z-10">
        <div>
          <p className="text-xs text-gray-500">禅悦国际瑜伽</p>
          <p className="font-semibold text-sm text-gray-800">{contract.contractNo}</p>
        </div>
        <Badge status={contract.status} />
      </div>

      {/* ── Contract ── */}
      <div className="pb-32">
        <ContractDocument
          contract={contract as unknown as ContractData}
          showSignatureArea={true}
          staffSignatureUrl={contract.staffSignatureUrl}
          customerSignatureUrl={contract.signatureUrl}
        />
      </div>

      {/* ── Action bar ── */}
      {isPending && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 no-print">
          <Link
            href={`/contract/${id}/sign`}
            className="block w-full text-center bg-brand-600 text-white font-semibold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform text-base"
          >
            ✍️ 点击签署合同
          </Link>
          <p className="text-center text-xs text-gray-400 mt-2">
            签署前请仔细阅读全部合同条款
          </p>
        </div>
      )}

      {contract.status === 'SIGNED' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 no-print">
          <div className="text-center text-sm text-green-700 font-semibold mb-1">
            ✅ 合同已签署完成
          </div>
          <p className="text-center text-xs text-gray-400">
            签署时间：{formatDateTime(contract.signedAt)}
          </p>
        </div>
      )}
    </div>
  )
}
