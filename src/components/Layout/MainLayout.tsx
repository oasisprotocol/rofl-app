import type { FC } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
} from '@oasisprotocol/ui-library/src/components/ui/sidebar';
import { Compass, LayoutDashboard } from 'lucide-react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@oasisprotocol/ui-library/src/components/ui/breadcrumb';
import { ErrorBoundary } from '../ErrorBoundary';

const navItems = {
  dashboard: { label: 'Dashboard', path: '/dashboard' },
  myApps: { label: 'My Apps', path: '/dashboard/apps' },
  machines: { label: 'Machines', path: '/dashboard/machines' },
  explore: { label: 'Explore', path: '/explore' },
};

const breadcrumbConfigs = [
  {
    pattern: navItems.explore.path,
    breadcrumbs: [navItems.explore],
    matchType: 'startsWith',
  },
  {
    pattern: navItems.machines.path,
    breadcrumbs: [navItems.dashboard, navItems.machines],
    matchType: 'startsWith',
  },
  {
    pattern: navItems.myApps.path,
    breadcrumbs: [navItems.dashboard, navItems.myApps],
    matchType: 'startsWith',
  },
  {
    pattern: navItems.dashboard.path,
    breadcrumbs: [navItems.dashboard],
    matchType: 'exact',
  },
];

export const MainLayout: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbConfig = () => {
    const pathname = location.pathname.toLowerCase();

    return breadcrumbConfigs.find((config) => {
      if (config.matchType === 'exact') {
        return pathname === config.pattern;
      } else {
        return pathname.startsWith(config.pattern);
      }
    });
  };

  const breadcrumbConfig = getBreadcrumbConfig();
  const breadcrumbs = breadcrumbConfig?.breadcrumbs || [];

  return (
    <Layout
      headerContent={<Header />}
      headerBreadcrumbsContent={
        !!breadcrumbs.length && (
          <Breadcrumb className="flex px-2">
            <BreadcrumbList>
              {breadcrumbs.flatMap((breadcrumb, i) => {
                const elements = [
                  <BreadcrumbItem key={breadcrumb.label + i}>
                    <BreadcrumbLink asChild>
                      <NavLink
                        to={breadcrumb.path}
                        className="text-foreground text-sm font-normal"
                      >
                        {breadcrumb.label}
                      </NavLink>
                    </BreadcrumbLink>
                  </BreadcrumbItem>,
                ];

                if (i + 1 < breadcrumbs.length) {
                  elements.push(
                    <BreadcrumbSeparator key={`sep-${breadcrumb.label}-${i}`} />
                  );
                }

                return elements;
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )
      }
      footerContent={<Footer />}
      sidebar={
        <Sidebar collapsible="icon" className="border-r !static !h-full">
          <SidebarContent className="bg-sidebar-background">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="ghost"
                      className="w-full justify-start p-2 h-8 rounded-md cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-sidebar-foreground" />
                      Dashboard
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Button
                        onClick={() => navigate('/dashboard/apps')}
                        variant="ghost"
                        className="w-full justify-start p-2 h-8 rounded-md cursor-pointer"
                      >
                        My Apps
                      </Button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Button
                        onClick={() => navigate('/dashboard/machines')}
                        variant="ghost"
                        className="w-full justify-start p-2 h-8 rounded-md cursor-pointer"
                      >
                        Machines
                      </Button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
                <SidebarMenuButton asChild>
                  <Button
                    onClick={() => navigate('/explore')}
                    variant="ghost"
                    className="w-full justify-start p-2 h-8 rounded-md cursor-pointer"
                  >
                    <Compass className="h-4 w-4 text-sidebar-foreground" />
                    Explore
                  </Button>
                </SidebarMenuButton>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      }
    >
      <div className="flex-1 p-5 h-5/6">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};
