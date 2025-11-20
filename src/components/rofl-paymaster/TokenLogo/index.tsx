import type { FC } from 'react'
import { ChainNativeCurrency } from '../../../types/rofl-paymaster.ts'
import { ROFL_PAYMASTER_ENABLED_CHAINS } from '../../../constants/rofl-paymaster-config.ts'

interface ChainTokenLogoProps {
  chainId?: number
  token?: ChainNativeCurrency
}

// TODO: use the token logo once available
export const TokenLogo: FC<ChainTokenLogoProps> = ({ chainId, token }) => {
  let displayToken: (ChainNativeCurrency & { logoURI?: string }) | undefined =
    token ||
    (chainId ? ROFL_PAYMASTER_ENABLED_CHAINS?.find(t => t.id === chainId)?.nativeCurrency : undefined)

  displayToken = {
    name: '',
    symbol: '',
    decimals: 18,
    ...(displayToken || {}),
    logoURI: '',
  }

  return (
    <div className="w-4 h-4">
      {displayToken?.logoURI ? (
        <img
          src={displayToken.logoURI}
          alt={displayToken.symbol}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" fill="currentColor" />
        </svg>
      )}
    </div>
  )
}
