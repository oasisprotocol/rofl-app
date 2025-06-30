import type { FC, ReactNode } from 'react'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarGroup,
} from '@oasisprotocol/ui-library/src/components/ui/sidebar'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { SidebarItemLabel } from './SidebarItemLabel'
import { Card, CardContent } from '@oasisprotocol/ui-library/src/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'

type CreateLayoutProps = {
  children: ReactNode
  currentStep?: number
  docsLink?: string
  hints?:
    | {
        title: string
        description: ReactNode
      }[]
    | undefined
  selectedTemplateName?: string
}

export const CreateLayout: FC<CreateLayoutProps> = ({
  children,
  currentStep = 1,
  docsLink,
  hints = [],
  selectedTemplateName,
}) => {
  const sidebarItems = [
    { label: 'ROFL Metadata', active: currentStep === 1 },
    { label: 'Agent Config', active: currentStep === 2 },
    { label: 'Build and Deploy', active: currentStep === 3 },
    { label: 'Payment', active: currentStep === 4 },
  ]

  return (
    <Layout
      headerContent={<Header />}
      footerContent={<Footer />}
      sidebar={
        <Sidebar collapsible="icon" className="border-r !static !h-full p-6">
          <SidebarContent className="bg-sidebar-background">
            <SidebarGroup>
              <SidebarMenu>
                <span className="text-xl font-semibold text-white">ROFL App Creation</span>
                <span className="text-sm text-muted-foreground pb-8">with {selectedTemplateName}</span>
                {sidebarItems.map((item, index) => (
                  <SidebarItemLabel
                    completed={index < currentStep - 1}
                    active={item.active}
                    key={item.label}
                    index={index}
                    label={item.label}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      }
    >
      <div className="flex-1 p-6 h-full">
        <div className="flex-1 flex flex-col md:flex-row items-start h-full">
          <div className="max-w-md mx-auto px-8 py-12 flex flex-col gap-8 items-center">{children}</div>
          <Card className="rounded-md md:w-[200px] border-0 p-4 gap-0 md:h-full">
            <CardContent className="text-muted-foreground text-sm p-0 flex-1">
              <div className="flex flex-col justify-between h-full">
                {hints.map((hint, index) => (
                  <div key={index}>
                    <div className="text-foreground text-sm font-semibold pb-2">{hint.title}</div>
                    <div>{hint.description}</div>
                  </div>
                ))}
                <Button variant="secondary" asChild className="w-full mt-6">
                  <a href={docsLink ?? 'https://docs.oasis.io/'} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center justify-center">
                      <span>Read our Docs</span>
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
