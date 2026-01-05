import type { FC } from 'react'
import { base } from 'viem/chains'
import { BaseLogo } from './BaseLogo.tsx'

interface ChainLogoProps {
  chainId?: number
}

export const ChainLogo: FC<ChainLogoProps> = ({ chainId }) => {
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      {chainId === base.id ? (
        <BaseLogo />
      ) : (
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" fill="currentColor" />
        </svg>
      )}
    </div>
  )
}
