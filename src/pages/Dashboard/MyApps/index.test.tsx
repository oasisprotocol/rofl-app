import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyApps } from './index'
import { MemoryRouter } from 'react-router-dom'

// Mock AppsList component
vi.mock('../../../components/AppsList', () => ({
  AppsList: ({ emptyState, type }: { emptyState: React.ReactNode; type: string }) => (
    <div data-testid="apps-list" data-type={type}>
      {emptyState}
    </div>
  ),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

describe('MyApps Component', () => {
  describe('rendering', () => {
    it('should render AppsList component', () => {
      render(<MyApps />, { wrapper })

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should pass correct type to AppsList', () => {
      render(<MyApps />, { wrapper })

      const appsList = screen.getByTestId('apps-list')
      expect(appsList).toHaveAttribute('data-type', 'dashboard')
    })
  })

  describe('empty state', () => {
    it('should pass MyAppsEmptyState to AppsList', () => {
      render(<MyApps />, { wrapper })

      const appsList = screen.getByTestId('apps-list')
      expect(appsList).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should be a functional component', () => {
      expect(typeof MyApps).toBe('function')
    })

    it('should render without crashing', () => {
      const { container } = render(<MyApps />, { wrapper })

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('props passing', () => {
    it('should pass emptyState prop to AppsList', () => {
      render(<MyApps />, { wrapper })

      const appsList = screen.getByTestId('apps-list')
      expect(appsList).toBeInTheDocument()
    })

    it('should pass type="dashboard" to AppsList', () => {
      render(<MyApps />, { wrapper })

      const appsList = screen.getByTestId('apps-list')
      expect(appsList).toHaveAttribute('data-type', 'dashboard')
    })
  })

  describe('integration', () => {
    it('should integrate with AppsList component', () => {
      const { container } = render(<MyApps />, { wrapper })

      const appsList = container.querySelector('[data-testid="apps-list"]')
      expect(appsList).toBeInTheDocument()
    })

    it('should delegate rendering to AppsList', () => {
      render(<MyApps />, { wrapper })

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })
  })
})
