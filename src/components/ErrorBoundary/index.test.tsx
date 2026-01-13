import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { ErrorBoundary } from './index'

// Mock the ErrorDisplay component
vi.mock('../ErrorDisplay', () => ({
  ErrorDisplay: ({ error, className }: { error: Error; className?: string }) =>
    React.createElement('div', { 'data-testid': 'error-display', className }, [
      React.createElement('h1', { key: 'title' }, 'Error Display'),
      React.createElement('p', { key: 'message' }, error.message),
    ]),
}))

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return React.createElement('div', null, 'No error')
}

// Component that throws a different error
const ThrowCustomError = () => {
  throw new Error('Custom error message')
}

// Component that renders normally
const NormalComponent = ({ children }: { children?: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'normal-component' }, children || 'Normal content')
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error for cleaner test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('basic error catching', () => {
    it('should render children when there is no error', () => {
      render(
        React.createElement(ErrorBoundary, null, React.createElement(NormalComponent, null, 'Test Children')),
      )

      expect(screen.getByTestId('normal-component')).toBeInTheDocument()
      expect(screen.getByText('Test Children')).toBeInTheDocument()
      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument()
    })

    it('should catch errors and render fallback UI', () => {
      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should not render children when error occurs', () => {
      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      expect(screen.queryByTestId('normal-component')).not.toBeInTheDocument()
    })
  })

  describe('fallbackContent prop', () => {
    it('should render custom fallbackContent when provided', () => {
      const customFallback = React.createElement(
        'div',
        { 'data-testid': 'custom-fallback' },
        'Custom Error UI',
      )

      render(
        React.createElement(
          ErrorBoundary,
          { fallbackContent: customFallback },
          React.createElement(ThrowError),
        ),
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument()
    })

    it('should use default ErrorDisplay when fallbackContent is not provided', () => {
      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })

    it('should pass className to default ErrorDisplay via fallbackContent', () => {
      render(
        React.createElement(
          ErrorBoundary,
          { className: 'custom-error-class' },
          React.createElement(ThrowError),
        ),
      )

      const errorDisplay = screen.getByTestId('error-display')
      expect(errorDisplay).toHaveClass('custom-error-class')
    })

    it('should render fallbackContent with custom children', () => {
      const customFallback = React.createElement(
        'div',
        { 'data-testid': 'custom-fallback' },
        'Something went wrong',
      )

      render(
        React.createElement(
          ErrorBoundary,
          { fallbackContent: customFallback },
          React.createElement(ThrowError),
        ),
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('fallbackRender prop', () => {
    it('should render custom fallbackRender when provided', () => {
      const fallbackRender = ({ error }: { error: Error }) =>
        React.createElement('div', { 'data-testid': 'custom-render' }, [
          React.createElement('h2', { key: 'title' }, 'Custom Render'),
          React.createElement('p', { key: 'message' }, error.message),
        ])

      render(React.createElement(ErrorBoundary, { fallbackRender }, React.createElement(ThrowError)))

      expect(screen.getByTestId('custom-render')).toBeInTheDocument()
      expect(screen.getByText('Custom Render')).toBeInTheDocument()
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should pass error to fallbackRender function', () => {
      const fallbackRender = ({ error }: { error: Error }) =>
        React.createElement(
          'div',
          { 'data-testid': 'error-message', 'data-error-message': error.message },
          'Error received',
        )

      render(React.createElement(ErrorBoundary, { fallbackRender }, React.createElement(ThrowCustomError)))

      expect(screen.getByTestId('error-message')).toHaveAttribute(
        'data-error-message',
        'Custom error message',
      )
    })

    it('should prioritize fallbackRender over fallbackContent when both are provided', () => {
      const fallbackRender = ({ error }: { error: Error }) =>
        React.createElement('div', { 'data-testid': 'render-fallback' }, 'From Render')
      const fallbackContent = React.createElement(
        'div',
        { 'data-testid': 'content-fallback' },
        'From Content',
      )

      render(
        React.createElement(
          ErrorBoundary,
          { fallbackRender, fallbackContent },
          React.createElement(ThrowError),
        ),
      )

      expect(screen.getByTestId('render-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('content-fallback')).not.toBeInTheDocument()
    })
  })

  describe('onError callback', () => {
    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowError)))

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
    })

    it('should pass error object to onError callback', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowCustomError)))

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Custom error message' }),
        expect.any(Object),
      )
    })

    it('should pass errorInfo to onError callback', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowError)))

      const errorInfo = onError.mock.calls[0][1]
      expect(errorInfo).toBeDefined()
      expect(typeof errorInfo.componentStack).toBe('string')
    })

    it('should log to console when onError is not provided', () => {
      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object),
      )
    })

    it('should not log to console when custom onError is provided', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowError)))

      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object),
      )
    })
  })

  describe('error state management', () => {
    it('should set hasError to true when error occurs', () => {
      const { container } = render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      // After catching error, should render error display
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })

    it('should store error in state when error occurs', () => {
      const fallbackRender = ({ error }: { error: Error }) =>
        React.createElement('div', { 'data-testid': 'stored-error', 'data-error': error.message }, 'Error')

      render(React.createElement(ErrorBoundary, { fallbackRender }, React.createElement(ThrowCustomError)))

      expect(screen.getByTestId('stored-error')).toHaveAttribute('data-error', 'Custom error message')
    })
  })

  describe('multiple children', () => {
    it('should render multiple children without errors', () => {
      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(NormalComponent, null, 'Child 1'),
          React.createElement(NormalComponent, null, 'Child 2'),
          React.createElement(NormalComponent, null, 'Child 3'),
        ),
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('should catch error from any child', () => {
      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(NormalComponent, null, 'Child 1'),
          React.createElement(ThrowError),
          React.createElement(NormalComponent, null, 'Child 3'),
        ),
      )

      expect(screen.queryByText('Child 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Child 3')).not.toBeInTheDocument()
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('should pass className to default ErrorDisplay', () => {
      render(
        React.createElement(ErrorBoundary, { className: 'my-custom-class' }, React.createElement(ThrowError)),
      )

      const errorDisplay = screen.getByTestId('error-display')
      expect(errorDisplay).toHaveClass('my-custom-class')
    })

    it('should not affect children when no error', () => {
      render(
        React.createElement(
          ErrorBoundary,
          { className: 'my-custom-class' },
          React.createElement(NormalComponent, null, 'No Error'),
        ),
      )

      expect(screen.getByTestId('normal-component')).toBeInTheDocument()
      expect(screen.getByText('No Error')).toBeInTheDocument()
    })
  })

  describe('different error types', () => {
    it('should handle standard Error objects', () => {
      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })

    it('should handle custom error messages', () => {
      const fallbackRender = ({ error }: { error: Error }) =>
        React.createElement('div', null, `Error: ${error.message}`)

      render(React.createElement(ErrorBoundary, { fallbackRender }, React.createElement(ThrowCustomError)))

      expect(screen.getByText('Error: Custom error message')).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should be a class component', () => {
      expect(ErrorBoundary.prototype).toBeDefined()
      expect(typeof ErrorBoundary.prototype.render).toBe('function')
      expect(typeof ErrorBoundary.prototype.componentDidCatch).toBe('function')
    })

    it('should use getDerivedStateFromError static method', () => {
      expect(typeof ErrorBoundary.getDerivedStateFromError).toBe('function')
    })

    it('should accept children prop', () => {
      render(React.createElement(ErrorBoundary, null, React.createElement(NormalComponent, null, 'Test')))

      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle null children', () => {
      const { container } = render(React.createElement(ErrorBoundary, null, null))

      // When children are null, ErrorBoundary returns null, which is correct
      expect(container.firstChild).toBeNull()
    })

    it('should handle undefined children', () => {
      const { container } = render(React.createElement(ErrorBoundary, null, undefined))

      // When children are undefined, ErrorBoundary returns null
      expect(container.firstChild).toBeNull()
    })

    it('should handle empty children', () => {
      const { container } = render(React.createElement(ErrorBoundary, null))

      // When no children are provided, ErrorBoundary returns null
      expect(container.firstChild).toBeNull()
    })

    it('should handle conditional error throwing', () => {
      render(
        React.createElement(ErrorBoundary, null, React.createElement(ThrowError, { shouldThrow: false })),
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument()
    })

    it('should handle array of children', () => {
      render(
        React.createElement(ErrorBoundary, null, [
          React.createElement(NormalComponent, { key: 1 }, 'Child 1'),
          React.createElement(NormalComponent, { key: 2 }, 'Child 2'),
        ]),
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })

    it('should handle fragment children', () => {
      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(React.Fragment, null, [
            React.createElement(NormalComponent, { key: 1 }, 'Fragment Child 1'),
            React.createElement(NormalComponent, { key: 2 }, 'Fragment Child 2'),
          ]),
        ),
      )

      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })

    it('should handle deeply nested component trees', () => {
      const DeepChild = () => React.createElement('div', { 'data-testid': 'deep-child' }, 'Deep Content')

      const Middle = () => React.createElement('div', null, React.createElement(DeepChild))
      const Parent = () => React.createElement('div', null, React.createElement(Middle))

      render(React.createElement(ErrorBoundary, null, React.createElement(Parent)))

      expect(screen.getByTestId('deep-child')).toBeInTheDocument()
    })
  })

  describe('nested error boundaries', () => {
    const InnerBoundary = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        ErrorBoundary,
        {
          fallbackRender: () =>
            React.createElement('div', { 'data-testid': 'inner-fallback' }, 'Inner Error'),
        },
        children,
      )

    const OuterBoundary = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        ErrorBoundary,
        {
          fallbackRender: () =>
            React.createElement('div', { 'data-testid': 'outer-fallback' }, 'Outer Error'),
        },
        children,
      )

    it('should catch error in inner boundary when child throws', () => {
      render(
        React.createElement(
          OuterBoundary,
          null,
          React.createElement(InnerBoundary, null, React.createElement(ThrowError)),
        ),
      )

      // Inner boundary should catch the error
      expect(screen.getByTestId('inner-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('outer-fallback')).not.toBeInTheDocument()
    })

    it('should not propagate error to outer boundary when inner catches it', () => {
      const outerOnError = vi.fn()

      render(
        React.createElement(
          ErrorBoundary,
          {
            onError: outerOnError,
            fallbackRender: () => React.createElement('div', { 'data-testid': 'outer' }, 'Outer'),
          },
          React.createElement(
            ErrorBoundary,
            {
              onError: vi.fn(),
              fallbackRender: () => React.createElement('div', { 'data-testid': 'inner' }, 'Inner'),
            },
            React.createElement(ThrowError),
          ),
        ),
      )

      // Inner boundary caught it, outer should not be called
      expect(outerOnError).not.toHaveBeenCalled()
      expect(screen.getByTestId('inner')).toBeInTheDocument()
      expect(screen.queryByTestId('outer')).not.toBeInTheDocument()
    })

    it('should allow outer boundary to catch errors outside inner boundary', () => {
      render(
        React.createElement(
          ErrorBoundary,
          { fallbackRender: () => React.createElement('div', { 'data-testid': 'outer' }, 'Outer Caught') },
          [
            React.createElement(NormalComponent, { key: 1 }, 'Safe'),
            React.createElement(ThrowError, { key: 2 }),
            React.createElement(
              ErrorBoundary,
              {
                key: 3,
                fallbackRender: () => React.createElement('div', { 'data-testid': 'inner' }, 'Inner Safe'),
              },
              React.createElement(NormalComponent, null, 'Inner Safe Content'),
            ),
          ],
        ),
      )

      // Outer boundary catches the error from ThrowError sibling
      expect(screen.getByTestId('outer')).toBeInTheDocument()
    })
  })

  describe('error recovery and reset', () => {
    it('should maintain error state once error is caught', () => {
      const { rerender } = render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()

      // Try to rerender with a different component
      // ErrorBoundary should still show error (no reset mechanism)
      rerender(
        React.createElement(ErrorBoundary, null, React.createElement(NormalComponent, null, 'Try Again')),
      )

      // State persists - error is still shown
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })

    it('should catch new errors after initial error', () => {
      // This demonstrates that once in error state, boundary stays there
      const { rerender } = render(
        React.createElement(
          ErrorBoundary,
          {
            fallbackRender: ({ error }) =>
              React.createElement(
                'div',
                { 'data-testid': 'error-state', 'data-message': error.message },
                'Error',
              ),
          },
          React.createElement(ThrowCustomError),
        ),
      )

      expect(screen.getByTestId('error-state')).toHaveAttribute('data-message', 'Custom error message')

      // Even if we change props, error state persists
      rerender(
        React.createElement(
          ErrorBoundary,
          {
            fallbackRender: ({ error }) =>
              React.createElement('div', { 'data-testid': 'error-state' }, error.message),
          },
          React.createElement(NormalComponent, null, 'Normal'),
        ),
      )

      // Error state persists
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
  })

  describe('getDerivedStateFromError', () => {
    it('should update state when error occurs', () => {
      const { container } = render(React.createElement(ErrorBoundary, null, React.createElement(ThrowError)))

      // After error, should not show children
      expect(container.textContent).toContain('Test error')
    })

    it('should store error object in state', () => {
      const testError = new Error('Specific error message')
      const ThrowSpecificError = () => {
        throw testError
      }

      const fallbackRender = ({ error }: { error: Error }) =>
        React.createElement('div', { 'data-testid': 'error-check', 'data-error-msg': error.message }, 'Error')

      render(React.createElement(ErrorBoundary, { fallbackRender }, React.createElement(ThrowSpecificError)))

      expect(screen.getByTestId('error-check')).toHaveAttribute('data-error-msg', 'Specific error message')
    })

    it('should return partial state with hasError and error', () => {
      // The static method getDerivedStateFromError should return the correct shape
      const result = ErrorBoundary.getDerivedStateFromError(new Error('Test'))

      expect(result).toHaveProperty('hasError', true)
      expect(result).toHaveProperty('error')
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Test')
    })
  })

  describe('componentDidCatch behavior', () => {
    it('should call componentDidCatch when error occurs', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowError)))

      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('should pass both error and errorInfo to componentDidCatch', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowError)))

      const [error, errorInfo] = onError.mock.calls[0]
      expect(error).toBeInstanceOf(Error)
      expect(errorInfo).toBeDefined()
      expect(typeof errorInfo.componentStack).toBe('string')
    })

    it('should include component stack in errorInfo', () => {
      const onError = vi.fn()

      render(React.createElement(ErrorBoundary, { onError }, React.createElement(ThrowError)))

      const errorInfo = onError.mock.calls[0][1]
      expect(errorInfo.componentStack).toBeTruthy()
      expect(errorInfo.componentStack.length).toBeGreaterThan(0)
    })
  })

  describe('error type variations', () => {
    it('should handle TypeError', () => {
      const ThrowTypeError = () => {
        throw new TypeError('Type error occurred')
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowTypeError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('Type error occurred')).toBeInTheDocument()
    })

    it('should handle ReferenceError', () => {
      const ThrowRefError = () => {
        throw new ReferenceError('Reference error occurred')
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowRefError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('Reference error occurred')).toBeInTheDocument()
    })

    it('should handle RangeError', () => {
      const ThrowRangeError = () => {
        throw new RangeError('Range error occurred')
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowRangeError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('Range error occurred')).toBeInTheDocument()
    })

    it('should handle SyntaxError', () => {
      const ThrowSyntaxError = () => {
        throw new SyntaxError('Syntax error occurred')
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowSyntaxError)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('Syntax error occurred')).toBeInTheDocument()
    })

    it('should handle custom error classes', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const ThrowCustom = () => {
        throw new CustomError('Custom error class')
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowCustom)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('Custom error class')).toBeInTheDocument()
    })

    it('should handle errors with no message', () => {
      const ThrowNoMessage = () => {
        const err = new Error()
        err.message = ''
        throw err
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(ThrowNoMessage)))

      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })
  })

  describe('prop changes and re-rendering', () => {
    it('should not recover when props change after error', () => {
      const { rerender } = render(
        React.createElement(ErrorBoundary, { className: 'initial' }, React.createElement(ThrowError)),
      )

      expect(screen.getByTestId('error-display')).toBeInTheDocument()

      // Change className prop
      rerender(
        React.createElement(
          ErrorBoundary,
          { className: 'changed' },
          React.createElement(NormalComponent, null, 'Normal'),
        ),
      )

      // Should still show error, not recover
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.queryByText('Normal')).not.toBeInTheDocument()
    })

    it('should handle updating fallbackRender prop', () => {
      const fallbackRender1 = ({ error }: { error: Error }) =>
        React.createElement('div', { 'data-testid': 'fallback-1' }, error.message)

      const fallbackRender2 = ({ error }: { error: Error }) =>
        React.createElement('div', { 'data-testid': 'fallback-2' }, `Updated: ${error.message}`)

      const { rerender } = render(
        React.createElement(
          ErrorBoundary,
          { fallbackRender: fallbackRender1 },
          React.createElement(ThrowError),
        ),
      )

      expect(screen.getByTestId('fallback-1')).toBeInTheDocument()

      // Update fallbackRender prop
      rerender(
        React.createElement(
          ErrorBoundary,
          { fallbackRender: fallbackRender2 },
          React.createElement(NormalComponent, null, 'Normal'),
        ),
      )

      // New fallback should be shown (but still in error state)
      expect(screen.getByTestId('fallback-2')).toBeInTheDocument()
    })
  })

  describe('integration with React features', () => {
    it('should work with React.StrictMode', () => {
      const StrictTest = () =>
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(NormalComponent, null, 'Strict Mode Test'),
          ),
        )

      render(StrictTest())

      expect(screen.getByText('Strict Mode Test')).toBeInTheDocument()
    })

    it('should work with React.memo children', () => {
      const MemoComponent = React.memo(() =>
        React.createElement('div', { 'data-testid': 'memo' }, 'Memo Content'),
      )

      render(React.createElement(ErrorBoundary, null, React.createElement(MemoComponent)))

      expect(screen.getByTestId('memo')).toBeInTheDocument()
    })

    it('should handle children with useEffect', () => {
      const EffectComponent = () => {
        React.useEffect(() => {
          // Side effect that doesn't throw
        }, [])
        return React.createElement('div', { 'data-testid': 'effect' }, 'Effect Component')
      }

      render(React.createElement(ErrorBoundary, null, React.createElement(EffectComponent)))

      expect(screen.getByTestId('effect')).toBeInTheDocument()
    })
  })
})
