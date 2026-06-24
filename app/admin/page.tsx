import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Badge from '@/components/ui/Badge'
import { ContractStatus } from '@prisma/client'
import { formatDate, formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [contracts, total, signedCount, pendingCount] = await Promise.all([
    prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.contract.count(),
    prisma.contract.count({ where: { status: 'SIGNED' } }),
    prisma.contract.count({ where: { status: 'PENDING' } }),
  ])

  const totalRevenue = await prisma.contract.aggregate({
    where: { status: 'SIGNED' },
    _sum: { courseAmount: true },
  })

  const revenue = totalRevenue._sum.courseAmount
    ? formatCurrency(totalRevenue._sum.courseAmount.toString())
    : '¥0.00'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top nav ── */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-gray-400">禅悦国际瑜伽</p>
          <h1 className="font-bold text-gray-900">合同管理后台</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export"
            className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl font-medium active:bg-gray-200"
          >
            📥 导出 Excel
          </a>
          <Link
            href="/admin/contracts/new"
            className="text-xs bg-brand-600 text-white px-3 py-2 rounded-xl font-medium active:bg-brand-700"
          >
            ＋ 新建合同
          </Link>
        </div>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '合同总数', value: total, icon: '📄' },
            { label: '已签署', value: signedCount, icon: '✅' },
            { label: '待签署', value: pendingCount, icon: '⏳' },
            { label: '已签总额', value: revenue, icon: '💰' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Contract list ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">最近合同</h2>
            <span className="text-xs text-gray-400">共 {total} 份</span>
          </div>

          {contracts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">暂无合同，点击右上角新建</p>
            </div>
          ) : (
            contracts.map((c) => (
              <Link
                key={c.id}
                href={`/admin/contracts/${c.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm truncate">
                        {c.customerName}
                      </span>
                      <Badge status={c.status as ContractStatus} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.contractNo}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {c.customerPhone} · {formatDate(c.createdAt, 'MM-DD HH:mm')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-brand-600">
                      {formatCurrency(c.courseAmount.toString())}
                    </p>
                    <p className="text-xs text-gray-400">{c.courseSessions}节</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── Bottom logout ── */}
      <div className="px-4 py-6 text-center">
        <form action="/api/auth/admin" method="POST">
          <input type="hidden" name="_method" value="DELETE" />
          <Link
            href="/api/auth/admin?logout=1"
            className="text-xs text-gray-400 underline"
          >
            退出登录
          </Link>
        </form>
      </div>
    </div>
  )
}
