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
import { sapphire, sapphireTestnet } from 'viem/chains'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks.ts'
import { ROFL_PAYMASTER_ENABLED_CHAINS_IDS } from '../../constants/rofl-paymaster-config.ts'

type ConnectButtonRenderProps = Parameters<React.ComponentProps<typeof ConnectButton.Custom>['children']>[0]

const TruncatedAddress: FC<{ address: string; className?: string }> = ({ address, className = '' }) => {
  return (
    <div className={`flex overflow-hidden max-w-max ${className}`}>
      <span className="flex-1 truncate min-w-0">{address.slice(0, -4)}</span>
      <span className="flex-shrink-0">{address.slice(-4)}</span>
    </div>
  )
}

const useNavigateToDashboardOnChainChange = ({ enabled }: { enabled: boolean }) => {
  const { chainId } = useAccount()
  const [selectedChainId, setSelectedChainId] = useState(chainId)
  const navigate = useNavigate()
  const { isAuthenticated } = useRoflAppBackendAuthContext()

  useEffect(() => {
    if (!enabled) return

    if (chainId && chainId !== selectedChainId && isAuthenticated) {
      if (!ROFL_PAYMASTER_ENABLED_CHAINS_IDS.includes(chainId.toString())) {
        setSelectedChainId(chainId)
        navigate('/dashboard', { replace: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedChainId should not trigger effect
  }, [enabled, chainId, navigate, isAuthenticated])
}

interface Props {
  children?: (props: ConnectButtonRenderProps) => ReactNode
  onMobileClose?: () => void
}

export const RainbowKitConnectButton: FC<Props> = ({ children, onMobileClose }) => {
  const isMobile = useIsMobile()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()

  useNavigateToDashboardOnChainChange({ enabled: !!children })

  const handleDisconnect = () => {
    disconnect()
    navigate('/', { replace: true })
    onMobileClose?.()
  }

  return (
    <ConnectButton.Custom>
      {props => {
        const {
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
          authenticationStatus,
        } = props

        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

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
              if (typeof children === 'function') return <>{children(props)}</>

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

              if (chain.id !== sapphire.id && chain.id !== sapphireTestnet.id) {
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
                          address={account.address as `0x${string}`}
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
