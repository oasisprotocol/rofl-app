import { type FC } from 'react'
import { type RoflApp } from '../../nexus/api'
import { AppCard } from '../../components/AppCard'
import { MetadataFormData } from '../CreateApp/types'

type DashboardAppsCardsProps = {
  cardsLimit: number
  pendingApps?: { [id: string]: MetadataFormData }
  roflApps: RoflApp[]
  network: 'mainnet' | 'testnet'
}

export const DashboardAppsCards: FC<DashboardAppsCardsProps> = ({
  cardsLimit,
  pendingApps,
  roflApps,
  network,
}) => {
  const pendingAppsNumber = pendingApps ? Object.keys(pendingApps).length : 0
  const remainingSlots = cardsLimit - pendingAppsNumber
  const roflAppsToShow = roflApps.slice(0, remainingSlots)

  return (
    <>
      {pendingApps &&
        Object.keys(pendingApps).map(key => (
          <AppCard
            key={`pending-${key}`}
            id={key}
            app={pendingApps[key]}
            network={network}
            type="dashboard"
            isPending
          />
        ))}

      {roflAppsToShow.map(app => (
        <AppCard key={app.id} app={app} network={network} type="dashboard" />
      ))}
    </>
  )
}
