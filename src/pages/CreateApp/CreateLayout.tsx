import type { FC, ReactNode } from 'react'
import { useState, useEffect } from 'react'
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
import { HelpWidget } from './HelpWidget'

type CreateLayoutProps = {
  children: ReactNode
  currentStep?: number
  selectedTemplateName?: string
  selectedTemplateId?: string
}

export const CreateLayout: FC<CreateLayoutProps> = ({
  children,
  currentStep = 1,
  selectedTemplateName,
  selectedTemplateId,
}) => {
  const [isHelpPanelExpanded, setIsHelpPanelExpanded] = useState(() => {
    const saved = localStorage.getItem('help-expanded')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('help-expanded', JSON.stringify(isHelpPanelExpanded))
  }, [isHelpPanelExpanded])

  const sidebarItems = [
    { label: 'Input metadata', active: currentStep === 1 },
    { label: 'Setup agent', active: currentStep === 2 },
    { label: 'Configure machine', active: currentStep === 3 },
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
                <span className="text-xl font-semibold text-white">Create your</span>
                <span className="text-md text-muted-foreground pb-8"> {selectedTemplateName}</span>
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
        <div className="flex-1 flex flex-col items-start h-full relative">
          <HelpWidget
            selectedTemplateId={selectedTemplateId}
            isExpanded={isHelpPanelExpanded}
            setIsExpanded={setIsHelpPanelExpanded}
          />
          <div className="max-w-lg px-8 py-12 flex flex-col gap-8 items-center w-full">{children}</div>
        </div>
      </div>
    </Layout>
  )
}
