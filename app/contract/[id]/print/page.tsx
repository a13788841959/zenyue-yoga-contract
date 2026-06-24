import { prisma } from '@/lib/prisma'
import ContractDocument from '@/components/ContractDocument'
import { ContractData } from '@/types'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

// Minimal print-only page – no chrome, just the contract
export default async function PrintPage({ params }: PageProps) {
  const { id } = await params
  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) notFound()

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <title>合同 {contract.contractNo}</title>
        <style>{`
          @media print { body { margin: 0; } }
          body { background: white; font-family: 'PingFang SC','Microsoft YaHei',sans-serif; }
        `}</style>
      </head>
      <body>
        <ContractDocument
          contract={contract as unknown as ContractData}
          showSignatureArea={true}
          staffSignatureUrl={contract.staffSignatureUrl}
          customerSignatureUrl={contract.signatureUrl}
        />
        <script
          dangerouslySetInnerHTML={{ __html: 'window.onload=()=>window.print()' }}
        />
      </body>
    </html>
  )
}
