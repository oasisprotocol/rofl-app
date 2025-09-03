import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { type FC, lazy, Suspense, useRef } from 'react'
import { useMonaco } from '@monaco-editor/react'
import * as yaml from 'yaml'
import * as monaco from 'monaco-editor'

const TextAreaFallback = ({ value }: { value?: string }) => (
  <textarea
    readOnly
    value={value}
    className="w-full h-full px-4 bg-[#1e1e1e] text-[#ce9178] overflow-hidden"
  />
)

const MonacoEditor = lazy(async () => {
  try {
    const monaco = await import('monaco-editor')
    const monacoReact = await import('@monaco-editor/react')
    window.MonacoEnvironment = {
      getWorker() {
        return new Worker(
          new URL('../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          { type: 'module' },
        )
      },
    }
    monacoReact.loader.config({ monaco })

    return monacoReact
  } catch {
    console.error('monaco-editor wrapper failed to load. Using <textarea> instead')
    return {
      default: (props => (
        <TextAreaFallback value={props.value || props.defaultValue} />
      )) as typeof import('@monaco-editor/react').default,
    }
  }
})

type CodeDisplayProps = {
  data: string
  className?: string
  readOnly?: boolean
  onChange?: (value: string | undefined) => void
}

export const CodeDisplay: FC<CodeDisplayProps> = ({ data, className, readOnly = true, onChange }) => {
  const monacoInstance = useMonaco()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  if (!data) {
    return null
  }

  const handleEditorWillMount = (monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#18181B',
      },
    })
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleEditorChange = (value: string | undefined) => {
    if (!monacoInstance || !editorRef.current || value === undefined) {
      return
    }

    const model = editorRef.current.getModel()
    if (!model) return

    const markers: monaco.editor.IMarkerData[] = []

    try {
      yaml.parse(value)
    } catch (e) {
      const yamlError = e as { message: string; linePos: { line: number; col: number }[] }
      if (yamlError.linePos && yamlError.linePos.length > 0) {
        const line = yamlError.linePos[0].line
        const column = yamlError.linePos[0].col
        markers.push({
          startLineNumber: line,
          endLineNumber: line,
          startColumn: column,
          endColumn: model.getLineMaxColumn(line),
          message: yamlError.message,
          severity: monacoInstance.MarkerSeverity.Error,
        })
      }
    }

    monacoInstance.editor.setModelMarkers(model, 'yaml-validator', markers)
    onChange?.(value)
  }

  return (
    <div className={cn('flex-1 h-[550px] overflow-auto resize-y', className)}>
      <Suspense fallback={<TextAreaFallback value={data} />}>
        <MonacoEditor
          loading={<TextAreaFallback value={data} />}
          language="yaml"
          value={data}
          theme="customTheme"
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            readOnly,
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </Suspense>
    </div>
  )
}
