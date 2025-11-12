import type { FC, ReactNode } from 'react'
import { FaucetInfo } from '../FaucetInfo'
import { useNetwork } from '../../../hooks/useNetwork.ts'
import { TopUpInitializationFailed } from '../TopUpInitializationFailed'

interface TopUpProps {
  minAmount: BigNumber
  onValidChange?: (isValid: boolean) => void
  onTopUpSuccess?: () => void
  onTopUpError?: (error: Error) => void
  children?: (props: { isValid: boolean }) => ReactNode
}

export const TopUp: FC<TopUpProps> = props => {
  const network = useNetwork()

  if (network === 'testnet') {
    return <FaucetInfo />
  }

  return (
    <>
      <TopUpInitializationFailed />
      {/* Fallback navigation */}
      {props.children?.({ isValid: false })}
    </>
  )
}
