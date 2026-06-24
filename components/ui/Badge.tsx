import { cn } from '@/lib/utils'
import { ContractStatus, STATUS_LABEL, STATUS_COLOR } from '@/types'

interface BadgeProps {
  status: ContractStatus
  className?: string
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        STATUS_COLOR[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
