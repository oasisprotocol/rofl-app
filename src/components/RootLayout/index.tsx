import type { FC } from 'react'
import { FathomAnalytics } from '../FathomAnalytics'
import { Outlet } from 'react-router-dom'
import { Toaster as Sonner, ToasterProps } from 'sonner'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Footer } from '../Layout/Footer'
import { Header } from '../Layout/Header'
import { ErrorBoundary } from '../ErrorBoundary'
import { ErrorDisplay } from '../ErrorDisplay'
import { RoflAppBackendAuthProvider } from '../../contexts/RoflAppBackendAuth/Provider'
import { RainbowKitProviderWithAuth } from '../../components/RainbowKitProviderWithAuth'

// TODO: use import { Toaster } from '@oasisprotocol/ui-library' when it doesn't break
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={'dark'}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

function fallbackRender({ error }: { error: Error }) {
  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        <ErrorDisplay error={error} className="min-h-[700px]" />
      </Layout>
    </div>
  )
}

export const RootLayout: FC = () => (
  <RoflAppBackendAuthProvider>
    <RainbowKitProviderWithAuth>
      <ErrorBoundary fallbackRender={fallbackRender}>
        <FathomAnalytics />
        <Toaster />
        <Outlet />
      </ErrorBoundary>
    </RainbowKitProviderWithAuth>
  </RoflAppBackendAuthProvider>
)
