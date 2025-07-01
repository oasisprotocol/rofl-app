import { useEffect, useState, type FC } from 'react'
import { CardWrapper } from '../../components/Card/index'
import dashboardImage from './images/dashboard.png'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { useAccount } from 'wagmi'

export const Cards: FC = () => {
  const { isConnected } = useAccount()

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="p-6 md:p-12">
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 transition-all duration-500 delay-250 ease-out',
          {
            'opacity-100 ': isLoaded,
            'opacity-0 ': !isLoaded,
          },
        )}
      >
        <CardWrapper
          title="Start with templates"
          description="Convert your containerized app into a trustless app in minutes via Oasis CLI."
          to={isConnected ? '/create' : '/templates'}
          label="Create app"
        />
        <CardWrapper
          title="Flexible deployment"
          description="Manage apps and access confidential VMs through a decentralized network of compute providers."
        />
      </div>
      <div
        className={cn('transition-all duration-1000 delay-500 ease-out', {
          'opacity-100': isLoaded,
          'opacity-0': !isLoaded,
        })}
      >
        <CardWrapper
          title="Explore the ecosystem"
          description="Browse live examples and discover what's possible with verifiable offchain compute."
          to="/explore"
          label="Explore now"
          image={dashboardImage}
        />
      </div>
    </div>
  )
}
