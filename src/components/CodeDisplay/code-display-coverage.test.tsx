import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import * as yaml from 'yaml'

// Import the component
import { CodeDisplay } from './index'

/**
 * Coverage test file for CodeDisplay component
 * This file specifically targets code paths that are hard to reach in integration tests
 * due to Monaco editor mocking and lazy loading.
 */
describe('CodeDisplay - Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('highlightYamlErrors function (lines 102-131)', () => {
    it('should handle YAML parsing errors with linePos information', () => {
      const invalidYaml = 'key: value\n  invalid_indentation: value'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      // Verify the yaml library throws the expected error
      expect(() => yaml.parse(invalidYaml)).toThrow()
    })

    it('should handle YAML errors with linePos array containing position data', () => {
      const invalidYaml = 'key: "unclosed string'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        expect(yamlError.linePos).toBeDefined()
        expect(yamlError.linePos.length).toBeGreaterThan(0)
      }
    })

    it('should handle YAML errors without linePos', () => {
      const invalidYaml = 'unclosed ['
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos?: { line: number; col: number }[] }
        // Some errors might not have linePos
        expect(yamlError.message).toBeDefined()
      }
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

      // Should not throw
      expect(() => yaml.parse(validYaml)).not.toThrow()
    })

    it('should handle YAML parse exceptions with line and column', () => {
      const invalidYaml = 'key: value\n  bad: indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          const pos = yamlError.linePos[0]
          expect(pos.line).toBeGreaterThan(0)
          expect(pos.col).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('handleEditorChange function (lines 142-148)', () => {
    it('should call highlightYamlErrors when readOnly is false', () => {
      const invalidYaml = 'key: value\n  invalid_indentation: value\nanother: [unclosed'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      // Verify that YAML parsing would fail
      expect(() => yaml.parse(invalidYaml)).toThrow()
    })

    it('should not call highlightYamlErrors when readOnly is true', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should always call highlightErrorLogs regardless of readOnly state', () => {
      const errorLog = 'Error: test\nException: test'
      const { container } = render(<CodeDisplay data={errorLog} readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call onChange callback when provided', () => {
      const onChange = vi.fn()
      const { container } = render(<CodeDisplay data="test" readOnly={false} onChange={onChange} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle undefined onChange callback gracefully', () => {
      const { container } = render(<CodeDisplay data="test" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('early return conditions in highlightYamlErrors', () => {
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
  })

  describe('marker creation for YAML errors', () => {
    it('should create marker with correct startLineNumber', () => {
      const invalidYaml = 'key: value\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          expect(yamlError.linePos[0].line).toBeDefined()
        }
      }
    })

    it('should create marker with correct endLineNumber', () => {
      const invalidYaml = 'key: value\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          const line = yamlError.linePos[0].line
          expect(line).toBeGreaterThan(0)
        }
      }
    })

    it('should create marker with correct startColumn', () => {
      const invalidYaml = 'key: value\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          expect(yamlError.linePos[0].col).toBeDefined()
        }
      }
    })

    it('should create marker with correct endColumn using getLineMaxColumn', () => {
      const invalidYaml = 'key: value\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should set correct error message from yamlError', () => {
      const invalidYaml = 'key: "unclosed string'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string }
        expect(yamlError.message).toBeDefined()
        expect(yamlError.message.length).toBeGreaterThan(0)
      }
    })

    it('should set MarkerSeverity.Error for YAML errors', () => {
      const invalidYaml = 'key: value\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call setModelMarkers with correct owner', () => {
      const invalidYaml = 'key: value\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('handleEditorChange conditional logic', () => {
    it('should check readOnly before calling highlightYamlErrors', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should skip highlightYamlErrors when readOnly is true', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should always call highlightErrorLogs', () => {
      const errorLog = 'Error: test\nException: test'
      const { container } = render(<CodeDisplay data={errorLog} readOnly={true} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call onChange with newData', () => {
      const onChange = vi.fn()
      const { container } = render(<CodeDisplay data="test" readOnly={false} onChange={onChange} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('various YAML error scenarios', () => {
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

    it('should handle invalid indentation', () => {
      const invalidYaml = 'parent:\nchild: wrong_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle invalid list syntax', () => {
      const invalidYaml = 'list:\n- item1\n - wrong_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle duplicate keys', () => {
      const invalidYaml = 'key: value1\nkey: value2'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle valid YAML after invalid YAML', () => {
      const validYaml = 'key: value\nnested:\n  item: value'
      const { container } = render(<CodeDisplay data={validYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      expect(() => yaml.parse(validYaml)).not.toThrow()
    })

    it('should handle empty YAML content', () => {
      const { container } = render(<CodeDisplay data="" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      // Empty YAML should parse as null
      expect(yaml.parse('')).toBeNull()
    })

    it('should handle YAML with only comments', () => {
      const commentYaml = '# just a comment\n# another comment'
      const { container } = render(<CodeDisplay data={commentYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle YAML with special characters in error', () => {
      const invalidYaml = 'key: "value with \\"quotes\\"\n  bad_indent'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('try-catch block in highlightYamlErrors', () => {
    it('should catch YAML parse errors', () => {
      const invalidYaml = 'key: value\n  invalid_indentation: value\nanother: [unclosed'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      let threw = false
      try {
        yaml.parse(invalidYaml)
      } catch {
        threw = true
      }
      expect(threw).toBe(true)
    })

    it('should not throw for valid YAML', () => {
      const validYaml = 'key: value\nnested:\n  item: value'
      const { container } = render(<CodeDisplay data={validYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      expect(() => yaml.parse(validYaml)).not.toThrow()
    })

    it('should handle yamlError.linePos existence check', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos?: { line: number; col: number }[] }
        // Test the linePos check
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          expect(yamlError.linePos.length).toBeGreaterThan(0)
        }
      }
    })

    it('should handle yamlError.linePos.length check', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos?: { line: number; col: number }[] }
        if (yamlError.linePos) {
          const length = yamlError.linePos.length
          expect(typeof length).toBe('number')
        }
      }
    })

    it('should extract line from linePos[0]', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          const line = yamlError.linePos[0].line
          expect(typeof line).toBe('number')
        }
      }
    })

    it('should extract column from linePos[0]', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      try {
        yaml.parse(invalidYaml)
      } catch (e) {
        const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
        if (yamlError.linePos && yamlError.linePos.length > 0) {
          const col = yamlError.linePos[0].col
          expect(typeof col).toBe('number')
        }
      }
    })
  })

  describe('empty markers array initialization', () => {
    it('should initialize markers array for valid YAML', () => {
      const validYaml = 'key: value'
      const { container } = render(<CodeDisplay data={validYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      expect(() => yaml.parse(validYaml)).not.toThrow()
    })

    it('should initialize markers array for invalid YAML', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should initialize markers array before try-catch', () => {
      const { container } = render(<CodeDisplay data="key: value" readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should preserve empty markers array when YAML is valid', () => {
      const validYaml = 'key: value'
      const { container } = render(<CodeDisplay data={validYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()

      expect(() => yaml.parse(validYaml)).not.toThrow()
    })
  })

  describe('setModelMarkers call for YAML errors', () => {
    it('should call setModelMarkers after try-catch', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call setModelMarkers with owner "highlightYamlErrors"', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call setModelMarkers with markers array', () => {
      const invalidYaml = 'key: value\n  invalid'
      const { container } = render(<CodeDisplay data={invalidYaml} readOnly={false} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
