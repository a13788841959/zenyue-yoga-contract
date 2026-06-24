'use client'

import { ContractData } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BRAND } from '@/types'

interface ContractDocumentProps {
  contract: ContractData
  showSignatureArea?: boolean
  staffSignatureUrl?: string | null
  customerSignatureUrl?: string | null
}

export default function ContractDocument({
  contract,
  showSignatureArea = true,
  staffSignatureUrl,
  customerSignatureUrl,
}: ContractDocumentProps) {
  const purchaseDate = formatDate(contract.purchaseDate)
  const expireDate = formatDate(contract.expireDate)
  const amount = formatCurrency(contract.courseAmount)

  return (
    <div className="contract-paper bg-white max-w-2xl mx-auto px-6 py-8 text-gray-900 text-sm leading-relaxed print:shadow-none">
      {/* ── Header ── */}
      <div className="text-center mb-6">
        <div className="text-xs text-gray-400 mb-1 tracking-widest">ZEN YUE INTERNATIONAL YOGA</div>
        <h1 className="text-2xl font-bold tracking-wide mb-1">{BRAND.name}</h1>
        <h2 className="text-base font-semibold text-gray-700 mb-3">课程服务合同</h2>
        <div className="flex justify-between text-xs text-gray-500 border-t border-b border-gray-200 py-2">
          <span>合同编号：<strong className="text-gray-700">{contract.contractNo}</strong></span>
          <span>签署日期：<strong className="text-gray-700">{purchaseDate}</strong></span>
        </div>
      </div>

      {/* ── Parties ── */}
      <div className="mb-4 text-sm leading-7">
        <p>
          <strong>甲方（服务提供方）：</strong>{BRAND.name}
        </p>
        <p>
          <strong>地　　　　　　址：</strong>{BRAND.address}
        </p>
        <p className="mt-2">
          <strong>乙方（会员）：</strong>{contract.customerName}
        </p>
        <p>
          <strong>手　机　号　码：</strong>{contract.customerPhone}
        </p>
        <p>
          <strong>身　份　证　号：</strong>{contract.customerIdCard}
        </p>
        {contract.customerWechat && (
          <p><strong>微　　信　　号：</strong>{contract.customerWechat}</p>
        )}
        {contract.emergencyContact && (
          <p>
            <strong>紧急联系人：</strong>{contract.emergencyContact}
            {contract.emergencyPhone && `　电话：${contract.emergencyPhone}`}
          </p>
        )}
      </div>

      {/* ── Course info table ── */}
      <div className="my-5 rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 text-sm border-b border-gray-200">
          课程详情
        </div>
        <table className="w-full text-sm">
          <tbody>
            {[
              ['课程名称', contract.courseName],
              ['课程类型', BRAND.courseType],
              ['课程节数', `${contract.courseSessions} 节`],
              ['课程金额', amount],
              ['购买日期', purchaseDate],
              ['到　期　日', expireDate],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100 last:border-0">
                <td className="py-2.5 px-4 text-gray-500 w-28 bg-gray-50/50">{label}</td>
                <td className="py-2.5 px-4 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Contract terms ── */}
      <div className="contract-body space-y-3 mt-6">
        <h3 className="font-bold text-base border-b border-gray-200 pb-1">合同条款</h3>

        <Section title="第一条 服务内容">
          甲方（{BRAND.name}）向乙方提供 {contract.courseSessions} 节{contract.courseName}，课程类型为{BRAND.courseType}，服务地点为{BRAND.address}。
        </Section>

        <Section title="第二条 课程期限">
          课程自签约日（{purchaseDate}）起一年内有效，最终有效期至 {expireDate}。逾期未消费的课时自动清零，不予退款。
        </Section>

        <Section title="第三条 预约规则">
          课程需提前24小时预约，乙方通过门店指定方式（微信/电话）预约指定教练及时段。甲方在合理范围内安排教练，如遇特殊情况将提前告知并协商调整。
        </Section>

        <Section title="第四条 取消规则">
          开课前12小时取消不扣课，课时保留。开课前不足12小时取消或无故缺席，视为正常消课一次，课时扣除。
        </Section>

        <Section title="第五条 退款规则">
          本课程属于优惠套餐课程，签约后不支持退款。未使用课程不可转让给第三方。如遇特殊情况（重大疾病、不可抗力等），双方本着诚信原则协商处理，甲方保留最终解释权。
        </Section>

        <Section title="第六条 健康声明">
          乙方确认自身身体状况适合参加运动训练。如有心脏病、高血压、骨伤、怀孕、术后恢复期或其他慢性疾病等情况，须在签署本合同前主动告知教练，以便制定安全适宜的课程方案。甲方对乙方因隐瞒健康状况导致的意外伤害不承担责任。
        </Section>

        <Section title="第七条 风险告知">
          瑜伽及运动训练存在一定运动风险。乙方已了解并自愿参加，将按照教练指导进行练习，自行承担因违反教练指令或超出个人能力范围操作导致的健康风险。甲方将采取合理措施保障乙方安全，但不对不可预见的运动意外承担赔偿责任。
        </Section>

        <Section title="第八条 隐私保护">
          会员的个人信息（姓名、手机号、身份证号、健康状况等）仅用于课程服务和会员管理，甲方承诺严格保密，不向第三方披露，亦不用于商业营销目的。
        </Section>

        <Section title="第九条 争议处理">
          双方因履行本合同产生的争议，应首先通过友好协商解决；协商不成的，向甲方所在地人民法院提起诉讼，适用中华人民共和国法律。
        </Section>

        <Section title="第十条 电子合同效力">
          本合同以电子方式签署，依据《中华人民共和国电子签名法》，乙方通过本系统完成手机号验证及手写电子签名，具有与纸质合同手写签名同等的法律效力。系统自动记录签署时间、IP地址及设备信息，作为合同生效的电子存证。
        </Section>
      </div>

      {/* ── Signature area ── */}
      {showSignatureArea && (
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-xs text-gray-500 mb-4 text-center">
            双方签字确认后，本合同正式生效
          </p>
          <div className="grid grid-cols-2 gap-8">
            {/* Staff signature */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                甲方签字（禅悦国际瑜伽）
              </p>
              <div className="h-20 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {staffSignatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={staffSignatureUrl}
                    alt="甲方签名"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">（待签署）</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                日期：{purchaseDate}
              </p>
            </div>

            {/* Customer signature */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                乙方签字（会员本人）
              </p>
              <div className="h-20 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {customerSignatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customerSignatureUrl}
                    alt="乙方签名"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">（待签署）</span>
                )}
              </div>
              {contract.signedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  签署时间：{formatDate(contract.signedAt, 'YYYY-MM-DD HH:mm')}
                </p>
              )}
            </div>
          </div>

          {/* Electronic proof */}
          {contract.signedAt && (
            <div className="mt-4 bg-green-50 rounded-lg px-4 py-3 text-xs text-green-700">
              <p className="font-semibold mb-0.5">✅ 电子合同已生效</p>
              <p>签署时间：{formatDate(contract.signedAt, 'YYYY年MM月DD日 HH:mm:ss')}</p>
              {contract.signIp && <p>签署IP：{contract.signIp}</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        <p>{BRAND.name} · {BRAND.address}</p>
        <p className="mt-0.5">合同编号：{contract.contractNo}</p>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="font-semibold text-gray-800 mb-0.5">{title}</p>
      <p className="text-gray-700 leading-7 pl-4">{children}</p>
    </div>
  )
}
