import { useEffect, useState, type FC, type ReactNode } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ChevronDown, Wallet } from 'lucide-react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dropdown-menu'
import { AccountAvatar } from '../AccountAvatar'
import { useAccount, useDisconnect } from 'wagmi'
import { useIsMobile } from '@oasisprotocol/ui-library/src/hooks/use-mobile'
import { useNavigate } from 'react-router-dom'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { ENABLED_CHAINS_IDS } from '../../constants/top-up-config.ts'

const TruncatedAddress: FC<{ address: string; className?: string }> = ({ address, className = '' }) => {
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <span className="flex-1 truncate min-w-0">{address.slice(0, -4)}</span>
      <span className="flex-shrink-0">{address.slice(-4)}</span>
    </div>
  )
}

interface Props {
  onMobileClose?: () => void
}

export const RainbowKitConnectButton: FC<Props> = ({ onMobileClose }) => {
  const { login, isLoading, isAuthenticated } = useRoflAppBackendAuthContext()
  const isMobile = useIsMobile()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()
  const { chainId, isConnected, address } = useAccount()
  const [selectedChainId, setSelectedChainId] = useState(chainId)

  useEffect(() => {
    const handleLogin = async () => {
      if (isConnected && address && !isLoading && !isAuthenticated) {
        try {
          await login()
        } catch (error) {
          console.error('Login failed:', error)
        }
      }
    }

    handleLogin()
  }, [isLoading, isAuthenticated, isConnected, address, login])

  useEffect(() => {
    if (chainId && chainId !== selectedChainId) {
      // slice(1) Ignore sapphire
      if (!ENABLED_CHAINS_IDS.slice(1).includes(chainId.toString())) {
        setSelectedChainId(chainId)
        navigate('/dashboard')
      }
    }
  }, [chainId, navigate, selectedChainId])

  const handleDisconnect = () => {
    disconnect()
    navigate('/')
    onMobileClose?.()
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={() => {
                      openConnectModal()
                      onMobileClose?.()
                    }}
                    className="max-md:w-full"
                  >
                    <Wallet />
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={() => {
                      openChainModal()
                      onMobileClose?.()
                    }}
                    variant="destructive"
                    className="max-md:w-full"
                  >
                    Wrong network
                  </Button>
                )
              }

              if (isMobile) {
                return (
                  <div className="flex flex-col items-start">
                    <button
                      className="p-2 flex items-center gap-3 w-full text-left hover:bg-accent/50 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => {
                        openAccountModal()
                        onMobileClose?.()
                      }}
                      aria-label={`Account ${account.address} with balance ${account.displayBalance}`}
                    >
                      <AccountAvatar
                        diameter={40}
                        account={{
                          address_eth: account.address as `0x${string}`,
                        }}
                      />
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <TruncatedAddress
                          address={address as `0x${string}`}
                          className="mono text-foreground text-base font-medium leading-6 w-full"
                        />
                        <p className="text-muted-foreground text-sm leading-5">{account.displayBalance}</p>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md p-2.5 h-11"
                      onClick={handleDisconnect}
                    >
                      <span className="text-destructive text-base font-medium leading-6">Sign out</span>
                    </Button>
                  </div>
                )
              }

              return (
                <div className="flex items-center">
                  <div className="flex items-center justify-center gap-2 py-2 px-4 h-10 bg-background border border-input rounded-l-md">
                    <AccountAvatar
                      diameter={24}
                      account={{
                        address_eth: account.address as `0x${string}`,
                      }}
                    />
                    <span className="text-sm font-medium text-foreground">{account.displayName}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-l-none rounded-r-md border-l-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={openAccountModal}>View Account</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.navigator.clipboard.writeText(account.address)}>
                        Copy Address
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openChainModal}>Switch network</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDisconnect}>Disconnect</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

type SimpleRainbowKitConnectButtonProps = {
  children: ReactNode
}

export const SimpleRainbowKitConnectButton: FC<SimpleRainbowKitConnectButtonProps> = ({ children }) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={() => {
                      openConnectModal()
                    }}
                    size="lg"
                  >
                    <>{children}</>
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    size="lg"
                    onClick={() => {
                      openChainModal()
                    }}
                    variant="destructive"
                    className="max-md:w-full"
                  >
                    Wrong network
                  </Button>
                )
              }
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
