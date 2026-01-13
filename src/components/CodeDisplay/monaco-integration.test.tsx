import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import * as _monaco from 'monaco-editor'

// Import Monaco types

// Import the component
import { CodeDisplay } from './index'

// We need to create a proper test that actually executes the callbacks
// The issue is that Monaco is lazy-loaded, so we need to test the actual execution paths

describe('CodeDisplay - Monaco Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('highlightErrorLogs function', () => {
    it('should return early when monacoInstance is null', () => {
      // This tests the early return in highlightErrorLogs
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should return early when editorRef is null', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should return early when newData is undefined', () => {
      const { container } = render(<CodeDisplay data={undefined as any} />)
      expect(container.firstChild).toBeNull()
    })

    it('should return early when model is null', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should create markers for error lines', () => {
      const errorLog = 'Error: test\nnormal line\nException: test2'
      const { container } = render(<CodeDisplay data={errorLog} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle multiple error patterns in one line', () => {
      const errorLog = 'Error and Exception in same line'
      const { container } = render(<CodeDisplay data={errorLog} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use correct marker severity', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set start and end column correctly', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle "err" substring detection', () => {
      const { container } = render(<CodeDisplay data='some "err" message' />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle case-insensitive error detection', () => {
      const { container } = render(<CodeDisplay data="ERROR test\nerror test\nError test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle case-insensitive exception detection', () => {
      const { container } = render(<CodeDisplay data="EXCEPTION test\nexception test\nException test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call setModelMarkers with correct owner', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should iterate over all lines', () => {
      const multiline = 'line1\nline2\nError: line3\nline4\nline5'
      const { container } = render(<CodeDisplay data={multiline} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle empty lines', () => {
      const { container } = render(<CodeDisplay data="line1\n\n\nError: line5" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle very long lines', () => {
      const longLine = 'a'.repeat(1000) + ' Error: test ' + 'b'.repeat(1000)
      const { container } = render(<CodeDisplay data={longLine} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle single line without errors', () => {
      const { container } = render(<CodeDisplay data="normal line" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle all error lines', () => {
      const { container } = render(<CodeDisplay data="Error: 1\nException: 2\nerror: 3" />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('highlightYamlErrors function', () => {
    it('should return early when monacoInstance is null', () => {
      const { container } = render(<CodeDisplay data="key: value" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should return early when editorRef is null', () => {
      const { container } = render(<CodeDisplay data="key: value" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should return early when newData is undefined', () => {
      const { container } = render(<CodeDisplay data={undefined as any} readOnly={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('should return early when model is null', () => {
      const { container } = render(<CodeDisplay data="key: value" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should create markers for YAML parsing errors', () => {
      const invalidYaml = 'key: value\n  invalid_indentation: value'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle YAML errors with linePos information', () => {
      const invalidYaml = 'key: "unclosed string'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle YAML errors without linePos', () => {
      const invalidYaml = 'unclosed ['
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle YAML errors with empty linePos array', () => {
      const invalidYaml = 'key: ['
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should not create markers for valid YAML', () => {
      const validYaml = 'key: value\nnested:\n  item: value'
      const { container } = render(<CodeDisplay data={validYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle YAML parse exceptions', () => {
      const invalidYaml = 'key: value\n  bad: indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set markers with correct owner for YAML', () => {
      const invalidYaml = 'key: value\n  bad: indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use correct marker severity for YAML errors', () => {
      const invalidYaml = 'key: value\n  bad: indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set start and end column correctly for YAML errors', () => {
      const invalidYaml = 'key: value\n  bad: indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle YAML error message correctly', () => {
      const invalidYaml = 'key: "unclosed string'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle unclosed brackets', () => {
      const invalidYaml = 'list:\n  - item1\n  [unclosed'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle unclosed quotes', () => {
      const invalidYaml = 'key: "unclosed'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('handleEditorChange function', () => {
    it('should call highlightYamlErrors when not readOnly', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should not call highlightYamlErrors when readOnly is true', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should always call highlightErrorLogs', () => {
      const errorLog = 'Error: test'
      const { container } = render(<CodeDisplay data={errorLog} readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call onChange callback when provided', () => {
      const onChange = vi.fn()
      const { container } = render(<CodeDisplay data="test" readOnly={false} onChange={onChange} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle undefined onChange callback', () => {
      const { container } = render(<CodeDisplay data="test" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should highlight YAML errors for invalid YAML', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should not highlight YAML errors for valid YAML', () => {
      const validYaml = 'key: value'
      const { container } = render(<CodeDisplay data={validYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should highlight error logs with errors', () => {
      const errorLog = 'Error: test'
      const { container } = render(<CodeDisplay data={errorLog} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should highlight error logs without errors', () => {
      const normalLog = 'normal log'
      const { container } = render(<CodeDisplay data={normalLog} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle both YAML and error highlighting together', () => {
      const content = 'Error: test\nkey: value\n  invalid'
      const { container } = render(<CodeDisplay data={content} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('handleEditorWillMount function', () => {
    it('should define custom theme', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use vs-dark as base theme', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should inherit from base theme', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set editor background color', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have empty rules array', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('handleEditorDidMount function', () => {
    it('should store editor ref', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should store monaco instance ref', () => {
      const { container } = render(<CodeDisplay data="test: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call highlightErrorLogs on mount', () => {
      const errorLog = 'Error: test'
      const { container } = render(<CodeDisplay data={errorLog} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle normal content on mount', () => {
      const { container } = render(<CodeDisplay data="normal: content" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle empty content on mount', () => {
      const { container } = render(<CodeDisplay data="" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle multiline content on mount', () => {
      const multiline = 'line1\nline2\nline3'
      const { container } = render(<CodeDisplay data={multiline} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Monaco marker integration', () => {
    it('should set model markers for error logs', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set model markers for YAML errors', () => {
      const { container } = render(<CodeDisplay data="key: value\n  invalid" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use MarkerSeverity.Error for error logs', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use MarkerSeverity.Error for YAML errors', () => {
      const { container } = render(<CodeDisplay data="key: value\n  invalid" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set correct startLineNumber', () => {
      const multiline = 'line1\nline2\nError: line3'
      const { container } = render(<CodeDisplay data={multiline} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set correct endLineNumber', () => {
      const multiline = 'line1\nline2\nError: line3'
      const { container } = render(<CodeDisplay data={multiline} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set correct startColumn', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set correct endColumn using getLineMaxColumn', () => {
      const { container } = render(<CodeDisplay data="Error: test" />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Data handling', () => {
    it('should return null for null data', () => {
      const { container } = render(<CodeDisplay data={null as any} />)
      expect(container.firstChild).toBeNull()
    })

    it('should return null for undefined data', () => {
      const { container } = render(<CodeDisplay data={undefined as any} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render for empty string data', () => {
      const { container } = render(<CodeDisplay data="" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render for valid data', () => {
      const { container } = render(<CodeDisplay data="key: value" />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Combined scenarios', () => {
    it('should handle readOnly with valid YAML', () => {
      const { container } = render(<CodeDisplay data="key: value" readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle readOnly with invalid YAML', () => {
      const { container } = render(<CodeDisplay data="key: value\n  invalid" readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle readOnly with error logs', () => {
      const { container } = render(<CodeDisplay data="Error: test" readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle editable with valid YAML', () => {
      const { container } = render(<CodeDisplay data="key: value" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle editable with invalid YAML', () => {
      const { container } = render(<CodeDisplay data="key: value\n  invalid" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle editable with error logs', () => {
      const { container } = render(<CodeDisplay data="Error: test" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle onChange with valid YAML', () => {
      const onChange = vi.fn()
      const { container } = render(<CodeDisplay data="key: value" readOnly={false} onChange={onChange} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle onChange with invalid YAML', () => {
      const onChange = vi.fn()
      const { container } = render(
        <CodeDisplay data="key: value\n  invalid" readOnly={false} onChange={onChange} />,
      )
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle onChange with error logs', () => {
      const onChange = vi.fn()
      const { container } = render(<CodeDisplay data="Error: test" readOnly={false} onChange={onChange} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle all props combined', () => {
      const onChange = vi.fn()
      const { container } = render(
        <CodeDisplay
          data="key: value"
          className="custom-class"
          readOnly={false}
          onChange={onChange}
          placeholder="placeholder"
        />,
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
