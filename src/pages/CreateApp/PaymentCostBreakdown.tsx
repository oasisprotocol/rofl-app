import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import type { FC } from 'react'

interface PaymentCostBreakdownProps {
  appCost: string
  deployCost: string
  transactionFee: string
  total: string
  hasEnoughBalance: boolean
  availableAmount: string
}

export const PaymentCostBreakdown: FC<PaymentCostBreakdownProps> = ({
  appCost,
  deployCost,
  transactionFee,
  total,
  hasEnoughBalance,
  availableAmount,
}) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-foreground">App registration</span>
          <span className="text-sm text-muted-foreground">{appCost}</span>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-foreground">Machine</span>
          <span className="text-sm text-muted-foreground">{deployCost}</span>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-foreground">Transaction fee(s)</span>
          <span className="text-sm text-muted-foreground">{transactionFee}</span>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex justify-between items-start space-y-6">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-sm font-medium text-foreground">{total}</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Separator orientation="horizontal" />

        <div className="flex items-start justify-between gap-y-6">
          <p className="text-sm text-muted-foreground">Available</p>
          <div className="flex flex-col items-end">
            {hasEnoughBalance && (
              <>
                <span className="text-sm text-muted-foreground">{availableAmount}</span>
              </>
            )}
            {!hasEnoughBalance && (
              <>
                <p className="text-sm text-destructive">{availableAmount}</p>
                <p className="text-xs text-destructive">Insufficient funds</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
