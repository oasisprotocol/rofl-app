import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks.ts'
import { useAccount, useChainId } from 'wagmi'
import {
  createAuthenticationAdapter,
  darkTheme,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  type Theme,
  useChainModal,
} from '@rainbow-me/rainbowkit'
import { fetchNonce, login } from '../../backend/api.ts'
import { createSiweMessage } from 'viem/siwe'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { AccountAvatar } from '../AccountAvatar'
import type { FC, PropsWithChildren } from 'react'
import { useNetwork } from '../../hooks/useNetwork.ts'

const rainbowKitTheme: Theme = {
  ...darkTheme(),
  fonts: {
    body: 'inherit',
  },
}

export const RainbowKitProviderWithAuth: FC<PropsWithChildren> = ({ children }) => {
  const { status } = useRoflAppBackendAuthContext()
  const { address } = useAccount()
  const currentChainId = useChainId()
  const chainId = useNetwork('mainnet') === 'mainnet' ? sapphire.id : sapphireTestnet.id
  const { chainModalOpen, openChainModal } = useChainModal()

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      return await fetchNonce(address!)
    },

    createMessage: ({ nonce, address, chainId }) => {
      const hostname = window.location.hostname
      let domain: string

      if (hostname === 'rofl.app') {
        domain = 'rofl.app'
      } else if (
        hostname === 'dev.rofl.app' ||
        hostname.endsWith('.rofl-app.pages.dev') ||
        hostname === 'localhost'
      ) {
        domain = 'dev.rofl.app'
      } else {
        domain = 'rofl.app'
      }

      const uri = `https://${domain}`
      const statement = 'Sign in to ROFL App Backend'

      return createSiweMessage({
        address,
        domain,
        statement,
        uri,
        version: '1',
        chainId,
        issuedAt: new Date(),
        nonce,
      })
    },

    verify: async ({ message, signature }) => {
      try {
        if (currentChainId !== chainId) {
          if (!chainModalOpen) {
            openChainModal?.()
          }
          return false
        }

        const token = await login({ message, signature })

        try {
          window.localStorage.setItem('jwt', token)
          window.dispatchEvent(new Event('storage'))

          return true
        } catch {
          // Ignore failures
        }
        return false
      } catch (error) {
        console.error('Authentication failed:', error)
        return false
      }
    },

    signOut: async () => {
      try {
        window.localStorage.removeItem('jwt')
        window.dispatchEvent(new Event('storage'))
      } catch {
        // Ignore failures
      }
    },
  })

  return (
    <RainbowKitAuthenticationProvider adapter={authenticationAdapter} status={status}>
      <RainbowKitProvider
        modalSize="compact"
        initialChain={sapphire}
        theme={rainbowKitTheme}
        avatar={({ address, size }) => (
          <AccountAvatar diameter={size} account={{ address_eth: address as `0x${string}` }} />
        )}
      >
        {children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}
