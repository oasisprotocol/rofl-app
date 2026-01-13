# Testing Quick Start Guide

Get started with testing in 5 minutes!

## Installation

First, install the dependencies:

```bash
yarn install
```

## Run Your First Test

1. **Run all tests in watch mode**:
   ```bash
   yarn test
   ```

2. **Run tests once**:
   ```bash
   yarn test:run
   ```

3. **Generate coverage report**:
   ```bash
   yarn test:coverage
   ```

## Write Your First Test

### Example: Testing a Utility Function

Create a file `src/utils/myUtil.test.ts`:

```tsx
import { describe, it, expect } from 'vitest'
import { myFunction } from './myUtil'

describe('myFunction', () => {
  it('should return the correct value', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })
})
```

### Example: Testing a Component

Create a file `src/components/MyComponent/MyComponent.test.tsx`:

```tsx
import { render, screen } from '@/test/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render the title', () => {
    render(<MyComponent title="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### Example: Testing with API Calls

```tsx
import { render, screen } from '@/test/test-utils'
import { server } from '@/test/mocks'
import { http, HttpResponse } from 'msw'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  // Setup MSW server
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should display data from API', async () => {
    render(<MyComponent />)

    // Wait for async data
    await screen.findByText('Loaded Data')
  })

  it('should handle API errors', async () => {
    // Override default mock to return error
    server.use(
      http.get('/api/endpoint', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    render(<MyComponent />)

    await screen.findByText('Error loading data')
  })
})
```

## Common Testing Patterns

### Testing User Interactions

```tsx
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

it('should handle button click', async () => {
  const handleClick = vi.fn()
  const user = userEvent.setup()

  render(<Button onClick={handleClick}>Click me</Button>)

  await user.click(screen.getByRole('button', { name: 'Click me' }))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Testing Form Inputs

```tsx
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

it('should update input value', async () => {
  const user = userEvent.setup()

  render(<MyForm />)

  const input = screen.getByLabelText('Email')
  await user.type(input, 'test@example.com')

  expect(input).toHaveValue('test@example.com')
})
```

### Testing Conditional Rendering

```tsx
import { render, screen } from '@/test/test-utils'

it('should show loading state', () => {
  render(<MyComponent isLoading={true} />)
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('should show content when loaded', () => {
  render(<MyComponent isLoading={false} />)
  expect(screen.getByText('Content')).toBeInTheDocument()
})
```

### Testing Custom Hooks

```tsx
import { renderHook } from '@testing-library/react'
import { useMyHook } from './useMyHook'

it('should return initial state', () => {
  const { result } = renderHook(() => useMyHook())

  expect(result.current.value).toBe('initial')
})
```

## Test Commands Reference

| Command | Description |
|---------|-------------|
| `yarn test` | Run tests in watch mode |
| `yarn test:run` | Run tests once |
| `yarn test:coverage` | Generate coverage report |
| `yarn test:ui` | Launch Vitest UI |

## Test File Location

Place test files next to the code they test:

```
src/
  components/
    MyComponent/
      index.tsx
      MyComponent.test.tsx  <-- Place test here
  hooks/
    useHook.ts
    useHook.test.ts        <-- Place test here
  utils/
    helper.ts
    helper.test.ts        <-- Place test here
```

## Important Import Paths

When writing tests, use these imports:

```tsx
// Test utilities
import { render, screen } from '@/test/test-utils'

// Mocks and handlers
import { server } from '@/test/mocks'
import { http, HttpResponse } from 'msw'

// React Testing Library
import userEvent from '@testing-library/user-event'

// Vitest
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
```

## Testing Checklist

Before committing your code, ensure:

- [ ] All tests pass: `yarn test:run`
- [ ] Coverage is adequate: `yarn test:coverage`
- [ ] No console errors or warnings
- [ ] Tests are descriptive and clear
- [ ] Tests cover happy path and edge cases
- [ ] Async operations are properly handled

## Troubleshooting

### Tests are failing with "Cannot find module"

Make sure you're using the correct import path alias:
```tsx
// Correct
import { render } from '@/test/test-utils'

// Incorrect
import { render } from '../../../test/test-utils'
```

### Tests are timing out

Use `waitFor` for async operations:
```tsx
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### MSW is not intercepting requests

Make sure to setup and teardown the server:
```tsx
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Next Steps

1. Read the full [Testing Guide](./TESTING.md)
2. Check out example tests in the codebase
3. Start writing tests for your features!

## Need Help?

- Check existing test files for examples
- Read [Vitest documentation](https://vitest.dev/)
- Read [React Testing Library documentation](https://testing-library.com/react)
- Ask the team for guidance

Happy testing!
