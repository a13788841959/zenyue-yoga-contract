import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { BRAND } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompletePage({ params }: PageProps) {
  const { id } = await params
  const contract = await prisma.contract.findUnique({ where: { id } })

  if (!contract || contract.status !== 'SIGNED') notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {/* Success icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">合同签署成功！</h1>
        <p className="text-gray-500 text-sm mb-6">
          您与{BRAND.name}的课程合同已正式生效
        </p>

        {/* Contract card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 text-left mb-6">
          {[
            ['合同编号', contract.contractNo],
            ['课程名称', contract.courseName],
            ['课程节数', `${contract.courseSessions} 节`],
            ['有效截止', formatDate(contract.expireDate)],
            ['签署时间', formatDate(contract.signedAt, 'YYYY-MM-DD HH:mm')],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <Link
          href={`/contract/${id}`}
          className="block w-full text-center bg-brand-600 text-white font-semibold py-4 rounded-2xl mb-3 active:scale-95 transition-transform"
        >
          查看合同详情
        </Link>

        <p className="text-xs text-gray-400 leading-5">
          请截图保存本页面以备查阅。
          <br />
          如有疑问请联系门店：{BRAND.address}
        </p>
      </div>
    </div>
  )
}
