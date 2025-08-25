import { type FC, Suspense } from 'react'
import { Link, Outlet, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ArrowLeft, ArrowRight, Wallet } from 'lucide-react'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { RainbowKitConnectButton } from '../RainbowKitConnectButton'
import { Spinner } from '../Spinner'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@oasisprotocol/ui-library/src/components/ui/dialog'
import { ErrorBoundary } from '../ErrorBoundary'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { AppError, AppErrors } from '../ErrorBoundary/errors.ts'

interface ProtectedOutletProps {
  redirectPath?: string
}

const ProtectedOutlet: FC<ProtectedOutletProps> = ({ redirectPath }) => {
  const { isAuthenticated, status } = useRoflAppBackendAuthContext()
  const { isConnected } = useAccount()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Spinner />
      </div>
    )
  }

  if ((!isConnected || !isAuthenticated) && redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  if (!isConnected || !isAuthenticated) {
    return null
  }

  return <Outlet />
}

interface ProtectedLayoutProps {
  redirectPath?: string
}

export const ProtectedLayout: FC<ProtectedLayoutProps> = ({ redirectPath }) => {
  const { isAuthenticated, status } = useRoflAppBackendAuthContext()
  const { isConnected } = useAccount()
  const { connectModalOpen } = useConnectModal()

  const showAuthModal =
    (status === 'loading' || !isConnected || !isAuthenticated) && !connectModalOpen && !redirectPath

  return (
    <>
      <Dialog open={showAuthModal}>
        <DialogTitle className="sr-only">Authenticate modal</DialogTitle>

        <DialogContent
          aria-describedby="auth-modal-description"
          className="w-full max-w-md [&>button:last-child]:hidden"
        >
          {status === 'loading' ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Spinner />
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-4">
                <Button variant="ghost" asChild>
                  <Link to="/">
                    <ArrowLeft />
                    Back to home
                  </Link>
                </Button>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Authenticate</h2>
                <p id="auth-modal-description" className="text-muted-foreground mb-6">
                  {!isConnected
                    ? 'Please connect your wallet to access the dashboard.'
                    : 'Your session has expired. Please complete the authentication process to access your dashboard.'}
                </p>
                <div className="space-y-4">
                  <RainbowKitConnectButton>
                    {({ openConnectModal }) => (
                      <Button
                        onClick={() => {
                          openConnectModal()
                        }}
                        className="w-full"
                      >
                        Authenticate
                        <ArrowRight />
                      </Button>
                    )}
                  </RainbowKitConnectButton>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground">
                {error instanceof AppError && error.type === AppErrors.WalletNotConnected
                  ? 'Please connect your wallet to continue'
                  : 'Something went wrong. Please try again.'}
              </p>
            </div>
          </div>
        )}
      >
        {/* Suspense will preserve the underlying state */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner />
            </div>
          }
        >
          <ProtectedOutlet redirectPath={redirectPath} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
