import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import type { FC, ReactNode } from 'react'

interface PaymentCostBreakdownProps {
  appCost: string
  deployCost: string
  transactionFee: string
  total: string
  availableAmount?: ReactNode
}

export const PaymentCostBreakdown: FC<PaymentCostBreakdownProps> = ({
  appCost,
  deployCost,
  transactionFee,
  total,
  availableAmount,
}) => {
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-foreground">App registration</p>
        <p className="text-sm font-medium text-foreground">{appCost}</p>
      </div>

      <Separator />

      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-foreground">Machine</p>
        <p className="text-sm font-medium text-foreground">{deployCost}</p>
      </div>

      <Separator />

      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-foreground">Transaction fee(s)</p>
        <p className="text-sm font-medium text-foreground">{transactionFee}</p>
      </div>

      <Separator />

      <div className="flex justify-between items-start">
        <p className="text-md font-semibold text-foreground ">Total</p>
        <p className="text-md font-semibold text-foreground">{total}</p>
      </div>

      {availableAmount && availableAmount}
    </div>
  )
}
