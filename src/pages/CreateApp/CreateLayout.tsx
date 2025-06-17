import type { FC, ReactNode } from 'react';
import { Header } from '../../components/Layout/Header';
import { Footer } from '../../components/Layout/Footer';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarGroup,
} from '@oasisprotocol/ui-library/src/components/ui/sidebar';
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout';
import { SidebarItemLabel } from './SidebarItemLabel';

type CreateLayoutProps = {
  children: ReactNode;
  currentStep?: number;
};

export const CreateLayout: FC<CreateLayoutProps> = ({
  children,
  currentStep = 1,
}) => {
  // Steps are 0-indexed in the index.tsx file, but we're starting from 1 here
  // because the first step (Template) has its own layout
  const sidebarItems = [
    { label: 'Metadata Input', active: currentStep === 1 },
    { label: 'Agent Specific Stuff', active: currentStep === 2 },
    { label: 'Build and Deploy', active: currentStep === 3 },
    { label: 'Payment', active: currentStep === 4 },
  ];

  return (
    <Layout
      headerContent={<Header />}
      footerContent={<Footer />}
      sidebar={
        <Sidebar collapsible="icon" className="border-r !static !h-full p-6">
          <SidebarContent className="bg-sidebar-background">
            <SidebarGroup>
              <SidebarMenu>
                <span className="text-xl font-semibold text-white">
                  ROFL App Creation
                </span>
                <span className="text-xs text-muted-foreground pb-8">
                  with TEMPLATE_NAME
                </span>
                {sidebarItems.map((item, index) => (
                  <SidebarItemLabel
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
      <div className="flex-1 p-5 h-5/6">{children}</div>
    </Layout>
  );
};
