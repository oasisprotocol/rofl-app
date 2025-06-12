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

const locationListMap: Record<string, string[]> = {
  '/explore': ['Explore'],
  '/dashboard/machines': ['Dashboard', 'Machines'],
  '/dashboard/apps': ['Dashboard', 'My Apps'],
  '/': ['Dashboard'],
};

export const MainLayout: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationList = Object.entries(locationListMap).find(([path]) =>
    location.pathname.toLowerCase().startsWith(path)
  )?.[1];

  const getBreadcrumbPath = (index: number) => {
    if (!locationList) return '/';
    if (index === 0 && locationList[0] === 'Dashboard') {
      return '/dashboard';
    }
    return location.pathname;
  };
  return (
    <Layout
      headerContent={<Header />}
      headerBreadcrumbsContent={
        !!locationList?.length && (
          <Breadcrumb className="flex px-2">
            <BreadcrumbList>
              {locationList.flatMap((loc, i) => {
                const elements = [
                  <BreadcrumbItem key={loc + i}>
                    <BreadcrumbLink asChild>
                      <NavLink
                        to={getBreadcrumbPath(i)}
                        className="text-foreground text-sm font-normal"
                      >
                        {loc}
                      </NavLink>
                    </BreadcrumbLink>
                  </BreadcrumbItem>,
                ];

                if (i + 1 < locationList.length) {
                  elements.push(
                    <BreadcrumbSeparator key={`sep-${loc}-${i}`} />
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
        <Outlet />
      </div>
    </Layout>
  );
};
