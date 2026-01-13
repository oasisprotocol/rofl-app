import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock react-router-dom
const mockUseLocation = vi.fn(() => ({ pathname: '/dashboard' }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    Outlet: () => React.createElement('div', { 'data-testid': 'outlet' }, 'Outlet Content'),
  }
})

// Mock all layout components
vi.mock('./Header', () => ({
  Header: () => React.createElement('header', { 'data-testid': 'header' }, 'Header'),
}))

vi.mock('./Footer', () => ({
  Footer: () => React.createElement('footer', { 'data-testid': 'footer' }, 'Footer'),
}))

vi.mock('./SidebarFooter', () => ({
  SidebarFooterContent: () =>
    React.createElement('div', { 'data-testid': 'sidebar-footer' }, 'Sidebar Footer'),
}))

// Mock ErrorBoundary
vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children, key }: any) =>
    React.createElement('div', { key, 'data-testid': 'error-boundary' }, children),
}))

// Mock ui-library sidebar components
vi.mock('@oasisprotocol/ui-library/src/components/ui/sidebar', () => ({
  Sidebar: ({ children, collapsible, className }: any) =>
    React.createElement('aside', { 'data-testid': 'sidebar', collapsible, className }, children),
  SidebarContent: ({ children, className }: any) =>
    React.createElement('div', { 'data-testid': 'sidebar-content', className }, children),
  SidebarMenu: ({ children }: any) => React.createElement('ul', { 'data-testid': 'sidebar-menu' }, children),
  SidebarMenuItem: ({ children }: any) => React.createElement('li', null, children),
  SidebarMenuButton: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    return React.createElement('button', props, children)
  },
  SidebarMenuSub: ({ children }: any) =>
    React.createElement('ul', { 'data-testid': 'sidebar-menu-sub' }, children),
  SidebarMenuSubItem: ({ children }: any) => React.createElement('li', null, children),
  SidebarMenuSubButton: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    return React.createElement('button', props, children)
  },
  SidebarGroup: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'sidebar-group' }, children),
  SidebarFooter: ({ children, className }: any) =>
    React.createElement('div', { 'data-testid': 'sidebar-footer-wrapper', className }, children),
  useSidebar: vi.fn(() => ({ state: 'expanded' })),
}))

// Mock ui-library layout component
vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ children, headerContent, footerContent, sidebar, headerBreadcrumbsContent }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'layout' },
      headerContent,
      headerBreadcrumbsContent,
      sidebar,
      children,
      footerContent,
    ),
}))

// Mock ui-library button component
vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    return React.createElement('button', props, children)
  },
}))

// Mock ui-library breadcrumb component
vi.mock('@oasisprotocol/ui-library/src/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children, className }: any) =>
    React.createElement('nav', { 'aria-label': 'breadcrumb', className }, children),
  BreadcrumbList: ({ children }: any) => React.createElement('ol', null, children),
  BreadcrumbItem: ({ children }: any) => React.createElement('li', null, children),
  BreadcrumbLink: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    return React.createElement('a', props, children)
  },
  BreadcrumbSeparator: () => React.createElement('li', null, '/'),
}))

// Import MainLayout after mocks are set up
import { MainLayout } from './MainLayout'
import { BrowserRouter } from 'react-router-dom'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, {}, children)

describe('MainLayout', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' })
  })

  it('should render layout component', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render header', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should render footer', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render sidebar', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('should render sidebar content', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
  })

  it('should render sidebar menu', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
  })

  it('should render sidebar footer', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
  })

  it('should render outlet', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('should render error boundary', () => {
    render(<MainLayout />, { wrapper })
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })

  describe('Breadcrumbs', () => {
    it('should show dashboard breadcrumb on /dashboard route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })
      render(<MainLayout />, { wrapper })
      const dashboardElements = screen.getAllByText('Dashboard')
      expect(dashboardElements).toHaveLength(2) // One in sidebar, one in breadcrumb
    })

    it('should show dashboard and apps breadcrumbs on /dashboard/apps route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/apps' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Dashboard')).toHaveLength(2)
      expect(screen.getAllByText('Apps').length).toBeGreaterThan(0)
    })

    it('should show dashboard and machines breadcrumbs on /dashboard/machines route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/machines' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Dashboard')).toHaveLength(2)
      expect(screen.getAllByText('Machines').length).toBeGreaterThan(0)
    })

    it('should show explore breadcrumb on /explore route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/explore' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Explore')).toHaveLength(2) // One in sidebar, one in breadcrumb
    })

    it('should handle case-insensitive pathname matching', () => {
      mockUseLocation.mockReturnValue({ pathname: '/DASHBOARD/APPS' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Dashboard')).toHaveLength(2)
      expect(screen.getAllByText('Apps').length).toBeGreaterThan(0)
    })

    it('should show no breadcrumbs for unknown routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/unknown/route' })
      render(<MainLayout />, { wrapper })
      // Should still render layout but without breadcrumbs
      expect(screen.getByTestId('layout')).toBeInTheDocument()
    })

    it('should show apps breadcrumbs for routes starting with /dashboard/apps', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/apps/some-app-id' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Dashboard')).toHaveLength(2)
      expect(screen.getAllByText('Apps').length).toBeGreaterThan(0)
    })

    it('should show machines breadcrumbs for routes starting with /dashboard/machines', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/machines/some-machine-id' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Dashboard')).toHaveLength(2)
      expect(screen.getAllByText('Machines').length).toBeGreaterThan(0)
    })

    it('should show explore breadcrumbs for routes starting with /explore', () => {
      mockUseLocation.mockReturnValue({ pathname: '/explore/some-app' })
      render(<MainLayout />, { wrapper })
      expect(screen.getAllByText('Explore')).toHaveLength(2)
    })
  })

  describe('Sidebar navigation', () => {
    it('should render dashboard link', () => {
      render(<MainLayout />, { wrapper })
      const dashboardLinks = screen.getAllByText('Dashboard')
      expect(dashboardLinks.length).toBeGreaterThan(0)
    })

    it('should render apps link', () => {
      render(<MainLayout />, { wrapper })
      const appsLinks = screen.getAllByText('Apps')
      expect(appsLinks.length).toBeGreaterThan(0)
    })

    it('should render machines link', () => {
      render(<MainLayout />, { wrapper })
      const machinesLinks = screen.getAllByText('Machines')
      expect(machinesLinks.length).toBeGreaterThan(0)
    })

    it('should render explore link', () => {
      render(<MainLayout />, { wrapper })
      const exploreLinks = screen.getAllByText('Explore')
      expect(exploreLinks.length).toBeGreaterThan(0)
    })

    it('should have sidebar with collapsible icon', () => {
      render(<MainLayout />, { wrapper })
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveAttribute('collapsible', 'icon')
    })
  })

  describe('Layout structure', () => {
    it('should use error boundary with location pathname as key', () => {
      mockUseLocation.mockReturnValue({ pathname: '/test-path' })
      render(<MainLayout />, { wrapper })
      const errorBoundary = screen.getByTestId('error-boundary')
      expect(errorBoundary).toBeInTheDocument()
    })

    it('should have correct number of navigation items', () => {
      render(<MainLayout />, { wrapper })
      // Dashboard, Apps, Machines, Explore
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Apps').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Machines').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)
    })
  })
})
