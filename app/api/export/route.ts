import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'

// GET /api/export  →  download all contracts as Excel
export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Build rows
    const statusMap: Record<string, string> = {
      PENDING:   '待签署',
      SIGNED:    '已签署',
      EXPIRED:   '已过期',
      CANCELLED: '已取消',
    }

    const rows = contracts.map((c, idx) => ({
      '序号':         idx + 1,
      '合同编号':     c.contractNo,
      '状态':         statusMap[c.status] ?? c.status,
      '学员姓名':     c.customerName,
      '手机号码':     c.customerPhone,
      '身份证号':     c.customerIdCard,
      '微信号':       c.customerWechat,
      '紧急联系人':   c.emergencyContact,
      '紧急联系电话': c.emergencyPhone,
      '课程名称':     c.courseName,
      '课程节数':     c.courseSessions,
      '课程金额':     c.courseAmount.toString(),
      '购买日期':     dayjs(c.purchaseDate).format('YYYY-MM-DD'),
      '到期日期':     dayjs(c.expireDate).format('YYYY-MM-DD'),
      '签署时间':     c.signedAt ? dayjs(c.signedAt).format('YYYY-MM-DD HH:mm:ss') : '',
      '签署IP':       c.signIp ?? '',
      '备注':         c.notes ?? '',
      '创建时间':     dayjs(c.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)

    // Auto-width
    const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
      wch: Math.max(key.length * 2, 12),
    }))
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, '合同列表')

    // Write to Buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const filename = `禅悦瑜伽合同_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`
    const encodedName = encodeURIComponent(filename)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('[GET /api/export]', err)
    return NextResponse.json({ success: false, error: '导出失败' }, { status: 500 })
  }
}
