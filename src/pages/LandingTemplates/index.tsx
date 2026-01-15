import { type FC } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import { TemplatesList } from '../../components/TemplatesList'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RainbowKitConnectButton } from '../../components/RainbowKitConnectButton'
import { useAccount } from 'wagmi'
import { dashboardPath } from '../paths'
import { useNetwork } from '../../hooks/useNetwork'

export const LandingTemplates: FC = () => {
  const { isConnected } = useAccount()
  const network = useNetwork()

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        <div className=" mx-auto px-8 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-white font-bold mb-2 text-center mb-8">
              Create your app from a template
            </h1>
            <div className="text-center">
              <RainbowKitConnectButton>
                {({ openConnectModal }) => {
                  return isConnected ? (
                    <Button size="lg" asChild>
                      <Link to={dashboardPath(network)}>
                        Get started
                        <ArrowRight />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        openConnectModal()
                      }}
                      className="max-md:w-full"
                    >
                      Connect Wallet
                      <ArrowRight />
                    </Button>
                  )
                }}
              </RainbowKitConnectButton>
            </div>
          </div>
          <Separator className="my-8" />
          <TemplatesList />
        </div>
      </Layout>
    </div>
  )
}
