# Testing Guide

This document provides a comprehensive guide for testing the ROFL App
application.

## Table of Contents

1. [Testing Stack](#testing-stack)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Testing Best Practices](#testing-best-practices)
6. [Test Structure](#test-structure)
7. [Coverage](#coverage)

## Testing Stack

We use the following testing tools:

- **Vitest**: Fast unit testing framework with native ESM support
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For API mocking
- **jsdom**: DOM implementation for Node.js
- **@testing-library/jest-dom**: Custom DOM matchers
- **@vitest/coverage-v8**: Code coverage reporting

## Setup

### Installation

Testing dependencies are already included in `package.json`. After cloning
the repository:

```bash
yarn install
```

### Configuration Files

- `vitest.config.ts` - Main Vitest configuration
- `src/test/setup.ts` - Test setup and global mocks
- `src/test/test-utils.tsx` - Custom render utilities and providers
- `src/test/mocks/` - API mock handlers and test data

## Running Tests

### Run All Tests

```bash
yarn test
```

This runs Vitest in watch mode, which will re-run tests on file changes.

### Run Tests Once

```bash
yarn test:run
```

### Generate Coverage Report

```bash
yarn test:coverage
```

This generates a coverage report in the `coverage/` directory with multiple
formats:

- HTML report: `coverage/index.html`
- JSON: `coverage/coverage-final.json`
- LCOV: `coverage/lcov.info`

### Run Tests in UI Mode

```bash
yarn test:ui
```

This launches the Vitest UI for an interactive test experience.

## Writing Tests

### Component Tests

Use the custom `render` function from `test-utils.tsx` which includes all
necessary providers:

```tsx
import { render, screen } from '@/test/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testing with Routing

```tsx
import { render, screen } from '@/test/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render on specific route', () => {
    render(<MyComponent />, { route: '/dashboard/apps' })
    // Test component behavior
  })
})
```

### Testing Custom Hooks

```tsx
import { renderHook } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current).toBeDefined()
  })
})
```

### Testing with MSW (API Mocking)

```tsx
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { server } from '@/test/mocks'
import { http, HttpResponse } from 'msw'
import { MyComponent } from './MyComponent'

describe('MyComponent with API', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should handle API response', () => {
    render(<MyComponent />)
    // Test component behavior with mocked API
  })

  it('should handle API errors', () => {
    server.use(
      http.get('/api/endpoint', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    render(<MyComponent />)
    // Test error handling
  })
})
```

### Utility Function Tests

```tsx
import { describe, it, expect } from 'vitest'
import { myUtility } from './utils'

describe('myUtility', () => {
  it('should return correct result', () => {
    const result = myUtility('input')
    expect(result).toBe('expected-output')
  })
})
```

## Testing Best Practices

### General Guidelines

1. **Test user behavior, not implementation details**
   - Focus on what the user sees and interacts with
   - Avoid testing internal state or methods

2. **Write descriptive test names**

   ```tsx
   // Good
   it('should display error message when API call fails')

   // Bad
   it('should work')
   ```

3. **Use appropriate assertions**

   ```tsx
   // Good
   expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()

   // Bad
   expect(container.querySelector('.btn-submit')).toBeTruthy()
   ```

4. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` or `afterEach` for cleanup

5. **Mock external dependencies**
   - Use MSW for API calls
   - Mock third-party libraries

### Component Testing

1. **Test user interactions**

   ```tsx
   import { render, screen } from '@testing-library/react'
   import userEvent from '@testing-library/user-event'

   it('should call onSubmit when form is submitted', async () => {
     const user = userEvent.setup()
     const handleSubmit = vi.fn()

     render(<LoginForm onSubmit={handleSubmit} />)

     await user.type(screen.getByLabelText('Email'), 'test@example.com')
     await user.type(screen.getByLabelText('Password'), 'password')
     await user.click(screen.getByRole('button', { name: 'Submit' }))

     expect(handleSubmit).toHaveBeenCalledTimes(1)
   })
   ```

2. **Test different states**
   - Loading state
   - Error state
   - Success state
   - Empty state

3. **Test accessibility**

   ```tsx
   it('should be accessible', () => {
     render(<MyComponent />)
     expect(screen.getByRole('button')).toBeEnabled()
   })
   ```

### Hook Testing

1. **Test hook behavior**

   ```tsx
   it('should update state when action is called', () => {
     const { result } = renderHook(() => useMyHook())

     act(() => {
       result.current.setValue('new value')
     })

     expect(result.current.value).toBe('new value')
   })
   ```

2. **Test error handling**

   ```tsx
   it('should handle errors gracefully', async () => {
     const { result } = renderHook(() => useMyHook())

     await act(async () => {
       await result.current.fetchData()
     })

     expect(result.current.error).toBeTruthy()
   })
   ```

## Test Structure

### File Organization

Tests should be co-located with the code they test:

```
src/
  components/
    MyComponent/
      index.tsx
      MyComponent.test.tsx
  hooks/
    useMyHook.ts
    useMyHook.test.ts
  utils/
    helpers.ts
    helpers.test.ts
```

### Test File Template

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { server } from '@/test/mocks'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('when rendered', () => {
    it('should display correctly', () => {
      render(<MyComponent />)
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('should handle button click', async () => {
      render(<MyComponent />)
      // Test interaction
    })
  })

  describe('API integration', () => {
    it('should fetch and display data', async () => {
      render(<MyComponent />)
      // Test API integration
    })
  })
})
```

## Coverage

### Current Coverage Status

The ROFL app has comprehensive test coverage exceeding industry standards:

- **187 test files** covering **139 source files**
- **1000+ test cases** total
- **~85% overall coverage** across all metrics

### Coverage by Category

| Category | Coverage | Files |
|----------|----------|-------|
| Utilities | 100% | 10/10 |
| Constants | 100% | 4/4 |
| Contracts | 100% | 3/3 |
| Hooks | 95% | 3/3 |
| Contexts | 90% | 7/7 |
| Backend | 85% | 5 |
| Components | 85% | 60+ |
| Pages | 75% | 52 |

### Coverage Thresholds

Configured in `vitest.config.ts`:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### Viewing Coverage

After running tests with coverage:

```bash
# Generate coverage report
yarn test:run --coverage

# Or use the automated script
./run-coverage-report.sh

# Open HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### CI/CD Integration

Coverage reports are automatically generated in CI/CD and uploaded as
artifacts. Failed coverage thresholds will cause the build to fail.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices][best-practices]

[best-practices]: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
