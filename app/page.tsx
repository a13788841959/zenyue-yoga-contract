import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-800 to-brand-600 p-6">
      <div className="text-center mb-12">
        <div className="text-white/70 text-sm mb-2 tracking-widest uppercase">
          Zen Yue International Yoga
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">禅悦国际瑜伽</h1>
        <p className="text-white/80 text-base">电子合同签署系统</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/admin/login"
          className="block w-full text-center bg-white text-brand-700 font-semibold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          🔐 管理员后台
        </Link>
      </div>

      <p className="mt-12 text-white/40 text-xs text-center">
        龙溪大道144号禅悦瑜伽4楼
      </p>
    </main>
  )
}
