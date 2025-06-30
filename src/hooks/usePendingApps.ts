import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useNetwork } from './useNetwork'
import { MetadataFormData } from '../pages/CreateApp/types'

type PendingAppsData = {
  [address: string]: {
    [network: string]: {
      [appId: string]: MetadataFormData
    }
  }
}

export const usePendingApps = () => {
  const { address } = useAccount()
  const network = useNetwork()

  const getPersistedPendingApps = useCallback((): PendingAppsData => {
    return JSON.parse(window.localStorage.getItem('pendingApps') || '{}')
  }, [])

  const getCurrentPendingApps = useCallback((): { [key: string]: MetadataFormData } => {
    if (!address) return {}
    const persistedData = getPersistedPendingApps()
    return persistedData[address]?.[network] || {}
  }, [address, network, getPersistedPendingApps])

  const [pendingApps, setPendingApps] = useState<{ [key: string]: MetadataFormData }>(getCurrentPendingApps)

  const addPendingApp = useCallback(
    (appId: string, metadata: MetadataFormData) => {
      if (!address || !appId) return

      const persistedData = getPersistedPendingApps()
      const addressData = persistedData[address] || {}
      const networkData = addressData[network] || {}

      const updatedData = {
        ...persistedData,
        [address]: {
          ...addressData,
          [network]: {
            ...networkData,
            [appId]: metadata,
          },
        },
      }

      window.localStorage.setItem('pendingApps', JSON.stringify(updatedData))
      setPendingApps(getCurrentPendingApps())
    },
    [address, network, getPersistedPendingApps, getCurrentPendingApps],
  )

  const removeCompletedApps = useCallback(
    (completedAppIds: string[]) => {
      if (!address || completedAppIds.length === 0) return

      const currentPending = getCurrentPendingApps()
      const updatedPendingApps = { ...currentPending }
      let hasChanges = false

      completedAppIds.forEach(appId => {
        if (updatedPendingApps[appId]) {
          delete updatedPendingApps[appId]
          hasChanges = true
        }
      })

      if (hasChanges) {
        const persistedData = getPersistedPendingApps()
        const updatedPersistedData = {
          ...persistedData,
          [address]: {
            ...persistedData[address],
            [network]: updatedPendingApps,
          },
        }

        window.localStorage.setItem('pendingApps', JSON.stringify(updatedPersistedData))
        setPendingApps(updatedPendingApps)
      }
    },
    [address, network, getCurrentPendingApps, getPersistedPendingApps],
  )

  useEffect(() => {
    setPendingApps(getCurrentPendingApps())
  }, [getCurrentPendingApps])

  return {
    pendingApps,
    addPendingApp,
    removeCompletedApps,
  }
}
