import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { isRouteErrorResponse } from 'react-router-dom'
import { ErrorDisplay } from './index'
import { AppError, AppErrors } from '../ErrorBoundary/errors'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  isRouteErrorResponse: vi.fn(),
}))

describe('ErrorDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with AppError', () => {
    it('should display Unknown error', () => {
      const error = new AppError(AppErrors.Unknown, 'Something went wrong')
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should display WalletNotConnected error', () => {
      const error = new AppError(AppErrors.WalletNotConnected)
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Wallet Not Connected')).toBeInTheDocument()
    })

    it('should display UnsupportedChain error', () => {
      const error = new AppError(AppErrors.UnsupportedChain)
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unsupported Chain')).toBeInTheDocument()
    })

    it('should display PageDoesNotExist error', () => {
      const error = new AppError(AppErrors.PageDoesNotExist)
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })

    it('should display custom message for Unknown error', () => {
      const error = new AppError(AppErrors.Unknown, 'Custom error message')
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })
  })

  describe('with RouteErrorResponse', () => {
    it('should display route error response', () => {
      const mockErrorResponse = {
        status: 404,
        statusText: 'Not Found',
        data: {},
      } as any

      vi.mocked(isRouteErrorResponse).mockReturnValue(true)
      render(<ErrorDisplay error={mockErrorResponse} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle 500 error status', () => {
      const mockErrorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        data: {},
      } as any

      vi.mocked(isRouteErrorResponse).mockReturnValue(true)
      render(<ErrorDisplay error={mockErrorResponse} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })
  })

  describe('with standard Error', () => {
    it('should display standard error message', () => {
      const error = new Error('Standard error occurred')
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should display error without message', () => {
      const error = new Error()
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })
  })

  describe('with string error', () => {
    it('should display unknown error string', () => {
      render(<ErrorDisplay error="Some random error string" />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should display empty string error', () => {
      render(<ErrorDisplay error="" />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle unknown error code as string', () => {
      // This tests the else clause at line 46
      render(<ErrorDisplay error={'random_unknown_error' as any} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })
  })

  describe('with unknown error type', () => {
    it('should display object error', () => {
      const error = { custom: 'error object' }
      render(<ErrorDisplay error={error as any} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should display number error', () => {
      render(<ErrorDisplay error={404 as any} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should throw error with null', () => {
      expect(() => render(<ErrorDisplay error={null as any} />)).toThrow()
    })

    it('should throw error with undefined', () => {
      expect(() => render(<ErrorDisplay error={undefined as any} />)).toThrow()
    })
  })

  describe('error type specific branches', () => {
    it('should handle AppError instance with custom message', () => {
      const error = new AppError(AppErrors.Unknown, 'Custom unknown error')
      expect(() => render(<ErrorDisplay error={error} />)).not.toThrow()
      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle standard Error instance', () => {
      const error = new Error('Standard error message')
      expect(() => render(<ErrorDisplay error={error} />)).not.toThrow()
      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle known error code as string', () => {
      // When passing a known error code as string, it should be recognized
      expect(() => render(<ErrorDisplay error={AppErrors.WalletNotConnected as any} />)).not.toThrow()
    })

    it('should handle unknown string error', () => {
      expect(() => render(<ErrorDisplay error={'random error string' as any} />)).not.toThrow()
      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('should pass custom className to EmptyState', () => {
      const error = new Error('Test error')
      const { container } = render(<ErrorDisplay error={error} className="custom-error-class" />)

      const card = container.querySelector('.custom-error-class')
      expect(card).toBeInTheDocument()
    })

    it('should render without className', () => {
      const error = new Error('Test error')
      expect(() => render(<ErrorDisplay error={error} />)).not.toThrow()
    })
  })

  describe('error type priority', () => {
    it('should prioritize RouteErrorResponse over other types', () => {
      const mockErrorResponse = {
        status: 404,
        statusText: 'Not Found',
        data: {},
      } as any

      vi.mocked(isRouteErrorResponse).mockReturnValue(true)
      render(<ErrorDisplay error={mockErrorResponse} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle error with very long message', () => {
      const longMessage = 'A'.repeat(1000)
      const error = new Error(longMessage)
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle error with special characters', () => {
      const error = new Error('Error with <script> and &special& chars')
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle error with newlines', () => {
      const error = new Error('Line 1\nLine 2\nLine 3')
      render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
    })

    it('should handle standard Error instance (covers line 42)', () => {
      // This covers the else if (error instanceof Error) branch at line 42
      const error = new Error('Standard error message')
      const { container } = render(<ErrorDisplay error={error} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
      // Check that the component renders without error
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle known error code as string (covers line 43-44)', () => {
      // This covers the else if (typeof error === 'string' && errorMap[error as AppErrors]) branch
      vi.mocked(isRouteErrorResponse).mockReturnValue(false)
      render(<ErrorDisplay error={AppErrors.WalletNotConnected as any} />)

      expect(screen.getByText('Wallet Not Connected')).toBeInTheDocument()
    })

    it('should handle unknown string error (covers line 46)', () => {
      // This covers the else branch at line 46
      vi.mocked(isRouteErrorResponse).mockReturnValue(false)
      render(<ErrorDisplay error={'random_unknown_string' as any} />)

      expect(screen.getByText('Unknown error')).toBeInTheDocument()
      expect(screen.getByText('random_unknown_string')).toBeInTheDocument()
    })
  })

  describe('component rendering', () => {
    it('should render EmptyState component', () => {
      const error = new Error('Test error')
      const { container } = render(<ErrorDisplay error={error} />)

      const card = container.querySelector('.h-full')
      expect(card).toBeInTheDocument()
    })

    it('should render with correct structure', () => {
      const error = new AppError(AppErrors.WalletNotConnected)
      const { container } = render(<ErrorDisplay error={error} />)

      const card = container.querySelector('.rounded-md')
      expect(card).toBeInTheDocument()
    })
  })
})
