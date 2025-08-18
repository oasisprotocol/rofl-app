import { load, trackPageview } from 'fathom-client'
import { Suspense, useEffect } from 'react'
import type { FC } from 'react'
import { useLocation } from 'react-router-dom'

const { VITE_FATHOM_SIDE_ID } = import.meta.env

const ANALYTICS_ENABLED = window.location.hostname === 'rofl.app'

export const FathomAnalyticsHandler: FC = () => {
  const location = useLocation()

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return

    load(VITE_FATHOM_SIDE_ID, {
      auto: false,
    })
  }, [])

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return
    if (!location) return

    trackPageview({
      url: location.pathname,
      referrer: document.referrer,
    })
  }, [location])

  return null
}

export const FathomAnalytics: FC = () => (
  <Suspense fallback={null}>
    <FathomAnalyticsHandler />
  </Suspense>
)
