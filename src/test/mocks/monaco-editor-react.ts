import { vi } from 'vitest'
import * as React from 'react'

// Mock for @monaco-editor/react package
const MonacoEditorMock = vi.fn(({ value, onChange, beforeMount, onMount, options, loading }: any) => {
  // Call beforeMount if provided
  if (beforeMount) {
    beforeMount({
      editor: {
        defineTheme: vi.fn(),
      },
    })
  }

  // Call onMount if provided
  if (onMount) {
    onMount(
      {
        getModel: vi.fn(() => ({
          getLineMaxColumn: vi.fn(() => 100),
        })),
      },
      {
        editor: {
          setModelMarkers: vi.fn(),
        },
        MarkerSeverity: {
          Error: 8,
        },
      },
    )
  }

  // Simulate onChange
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  return loading
    ? loading
    : React.createElement('textarea', {
        'data-testid': 'monaco-editor',
        value: value,
        onChange: handleChange,
        readOnly: options?.readOnly,
        placeholder: options?.placeholder,
      })
})

export default MonacoEditorMock
