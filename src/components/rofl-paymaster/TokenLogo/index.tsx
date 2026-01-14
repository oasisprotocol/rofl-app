import type { FC } from 'react'
import { USDCLogo } from './USDCLogo.tsx'
import { USDTLogo } from './USDTLogo.tsx'
import { RoseLogo } from './RoseLogo.tsx'

interface ChainTokenLogoProps {
  tokenSymbol?: string
}

export const TokenLogo: FC<ChainTokenLogoProps> = ({ tokenSymbol }) => {
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      {tokenSymbol === 'USDC' ? (
        <USDCLogo />
      ) : tokenSymbol === 'USDT' || tokenSymbol === 'Tether USD' ? (
        <USDTLogo />
      ) : tokenSymbol === 'ROSE' ? (
        <RoseLogo />
      ) : (
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" fill="currentColor" />
        </svg>
      )}
    </div>
  )
}
