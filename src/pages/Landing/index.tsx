import { type FC } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import { Cards } from './Cards'
import { Hero } from './Hero'

export const Landing: FC = () => {
  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        <Hero />
        <Cards />
      </Layout>
    </div>
  )
}
