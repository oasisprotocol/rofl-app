import { type FC } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import { TemplatesList } from '../../components/TemplatesList'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SimpleRainbowKitConnectButton } from '../../components/RainbowKitConnectButton'
import { useAccount } from 'wagmi'

export const LandingTemplates: FC = () => {
  const { isConnected } = useAccount()

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        <div className=" mx-auto px-8 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-white font-bold mb-2 text-center mb-8">
              Create your app from a template
            </h1>
            <p className="text-muted-foreground text-md text-center">
              {isConnected ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">Get started</Link>
                </Button>
              ) : (
                <SimpleRainbowKitConnectButton>
                  Connect Wallet
                  <ArrowRight />
                </SimpleRainbowKitConnectButton>
              )}
            </p>
          </div>
          <Separator className="my-8" />
          <TemplatesList />
        </div>
      </Layout>
    </div>
  )
}
