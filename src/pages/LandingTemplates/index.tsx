import { type FC } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@oasisprotocol/ui-library/src/components/ui/card'
import { templates } from '../CreateApp/templates'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'

export const LandingTemplates: FC = () => {
  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        {/* If this is what product wants get this content from TemplateStep */}
        <div className=" mx-auto px-8 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-white font-bold mb-2 text-center">
              Create your app from a template
            </h1>
            {/* <p className="text-muted-foreground text-md text-center">
              Convert your containerized app into a trustless app in minutes via Oasis CLI
            </p> */}
            <p className="text-muted-foreground text-md text-center">
              <Button size="lg" className="mt-4">
                {/* <Link to="/create-app" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"> */}
                Connect Wallet
                {/* </Link> */}
              </Button>
            </p>
          </div>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card key={template.id} className="rounded-md pt-6 flex flex-col">
                <div className="rounded-t-md h-[160px] -mt-6">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </div>
                <CardHeader className="gap-0">
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <span className="text-muted-foreground text-sm">
                    {template.description || 'No description available.'}
                  </span>
                </CardContent>
              </Card>
            ))}
            <Card className="border-0 rounded-md">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
                <span className="text-muted-foreground text-lg font-semibold">Custom build</span>
                <span className="text-muted-foreground text-sm">
                  Convert your containerized app into a trustless app in minutes via Oasis CLI.
                  <br />
                  <Button variant="secondary" asChild className="mt-4">
                    <a
                      href="https://docs.oasis.io/build/rofl/quickstart/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="flex items-center justify-center">
                        <span>Read our Docs</span>
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </span>
                    </a>
                  </Button>
                </span>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-md opacity-50">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
                <span className="text-muted-foreground text-lg font-semibold">More coming soon...</span>
              </CardContent>
            </Card>

            {/* if there is not a multiple of 3 templates (including new template soon) add a semi transparent card  */}
            {(templates.length + 2) % 3 !== 0 && (
              <Card className="border-0 rounded-md rounded-lg bg-gradient-to-r from-card to-transparent"></Card>
            )}
          </div>
        </div>
      </Layout>
    </div>
  )
}
