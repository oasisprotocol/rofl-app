import { ErrorDisplay } from '../ErrorDisplay'
import { AppError, AppErrors } from '../ErrorBoundary/errors'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Footer } from '../Layout/Footer'
import { Header } from '../Layout/Header'

export function NotFound() {
  const notFoundError = new AppError(AppErrors.PageDoesNotExist)

  return (
    <Layout headerContent={<Header />} footerContent={<Footer />}>
      <ErrorDisplay error={notFoundError} className="min-h-[700px]" />
    </Layout>
  )
}
