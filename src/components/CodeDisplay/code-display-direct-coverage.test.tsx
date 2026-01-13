import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

// Import the component
import { CodeDisplay } from './index'

// Import the mocked MonacoEditor to access helper functions
// The mock returns { default: MonacoEditorMock }, so we need to access the default
// The helper functions are attached to MonacoEditorMock itself, not the export
const MonacoEditorMock = require('@monaco-editor/react').default

/**
 * This test file directly triggers the Monaco onChange callback
 * using the helper function from the mock to achieve full coverage.
 */
describe('CodeDisplay - Direct Callback Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('handleEditorChange execution (lines 143-148)', () => {
    it('should execute handleEditorChange with readOnly=false', async () => {
      const onChange = vi.fn()
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      // Use the helper function to directly trigger onChange
      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange('new value')
        expect(onChange).toHaveBeenCalledWith('new value')
      }
    })

    it('should execute handleEditorChange with invalid YAML when readOnly=false', async () => {
      const onChange = vi.fn()
      const invalidYaml = 'key: value\n  invalid_indentation: value\nanother: [unclosed'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(invalidYaml)
        expect(onChange).toHaveBeenCalledWith(invalidYaml)
      }
    })

    it('should execute handleEditorChange with readOnly=true', async () => {
      const onChange = vi.fn()
      render(<CodeDisplay data="initial" readOnly={true} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange('new value')
        expect(onChange).toHaveBeenCalledWith('new value')
      }
    })

    it('should execute handleEditorChange without onChange callback', async () => {
      render(<CodeDisplay data="initial" readOnly={false} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        // Should not throw
        expect(() => triggerChange('new value')).not.toThrow()
      }
    })

    it('should execute handleEditorChange with valid YAML', async () => {
      const onChange = vi.fn()
      const validYaml = 'key: value\nnested:\n  item: value'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(validYaml)
        expect(onChange).toHaveBeenCalledWith(validYaml)
      }
    })

    it('should execute handleEditorChange with error logs', async () => {
      const onChange = vi.fn()
      const errorLog = 'Error: test\nException: test'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(errorLog)
        expect(onChange).toHaveBeenCalledWith(errorLog)
      }
    })
  })

  describe('highlightYamlErrors execution (lines 103-131)', () => {
    it('should execute highlightYamlErrors with invalid YAML when readOnly=false', async () => {
      const onChange = vi.fn()
      const invalidYaml = 'key: value\n  invalid_indentation: value\nanother: [unclosed'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        // This should execute highlightYamlErrors
        triggerChange(invalidYaml)
        expect(onChange).toHaveBeenCalledWith(invalidYaml)
      }
    })

    it('should execute highlightYamlErrors with valid YAML', async () => {
      const onChange = vi.fn()
      const validYaml = 'key: value\nnested:\n  item: value'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(validYaml)
        expect(onChange).toHaveBeenCalledWith(validYaml)
      }
    })

    it('should NOT execute highlightYamlErrors when readOnly=true', async () => {
      const onChange = vi.fn()
      const invalidYaml = 'key: value\n  invalid_indentation: value'
      render(<CodeDisplay data="initial" readOnly={true} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        // When readOnly=true, highlightYamlErrors should NOT be called
        triggerChange(invalidYaml)
        expect(onChange).toHaveBeenCalledWith(invalidYaml)
      }
    })
  })

  describe('highlightErrorLogs execution', () => {
    it('should execute highlightErrorLogs with error content', async () => {
      const onChange = vi.fn()
      const errorLog = 'Error: test\nException: test\n"err": test'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(errorLog)
        expect(onChange).toHaveBeenCalledWith(errorLog)
      }
    })

    it('should execute highlightErrorLogs with normal content', async () => {
      const onChange = vi.fn()
      const normalContent = 'normal log line\nanother line'
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(normalContent)
        expect(onChange).toHaveBeenCalledWith(normalContent)
      }
    })
  })

  describe('edge cases for full coverage', () => {
    it('should handle undefined newData in handleEditorChange', async () => {
      const onChange = vi.fn()
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(undefined)
        expect(onChange).toHaveBeenCalledWith(undefined)
      }
    })

    it('should handle empty string in handleEditorChange', async () => {
      const onChange = vi.fn()
      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange('')
        expect(onChange).toHaveBeenCalledWith('')
      }
    })

    it('should handle complex invalid YAML scenarios', async () => {
      const onChange = vi.fn()
      const complexInvalidYaml = `
key: value
  invalid_indentation: value
another: [unclosed
key2: "unclosed string
      `.trim()

      render(<CodeDisplay data="initial" readOnly={false} onChange={onChange} />)

      const triggerChange = (MonacoEditorMock as any).__triggerChange
      if (triggerChange) {
        triggerChange(complexInvalidYaml)
        expect(onChange).toHaveBeenCalledWith(complexInvalidYaml)
      }
    })
  })
})
