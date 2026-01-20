import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { type FC, lazy, Suspense, useRef, useLayoutEffect } from 'react'
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
  autoScrollToBottom?: boolean
  onChange?: (value: string | undefined) => void
  // CSS white-space set in index.css for proper placeholder rendering
  placeholder?: string
}

export const CodeDisplay: FC<CodeDisplayProps> = ({
  data,
  className,
  readOnly = true,
  autoScrollToBottom = false,
  onChange,
  placeholder,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoInstanceRef = useRef<typeof monaco | null>(null)
  const previousDataRef = useRef<string>(data)

  function scrollToBottom() {
    if (!editorRef.current) return
    editorRef.current.revealLine(editorRef.current.getModel()?.getLineCount() ?? 0)
  }
  useLayoutEffect(() => {
    if (!autoScrollToBottom) return
    const previousData = previousDataRef.current
    previousDataRef.current = data
    if (!editorRef.current) return
    if (data === previousData) return

    const wasScrolledToTheEnd =
      editorRef.current.getScrollTop() + editorRef.current.getLayoutInfo().height >=
      editorRef.current.getScrollHeight() - 40 // some threshold
    if (wasScrolledToTheEnd || !previousData) {
      setTimeout(() => scrollToBottom(), 1)
    }
  }, [data, autoScrollToBottom])

  if (data === null || data === undefined) {
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

  const highlightErrorLogs = (newData: string | undefined) => {
    const monacoInstance = monacoInstanceRef.current
    if (!monacoInstance || !editorRef.current || newData === undefined) {
      return
    }
    const model = editorRef.current.getModel()
    if (!model) return

    const markers: monaco.editor.IMarkerData[] = []
    for (const [i, line] of newData.split('\n').entries()) {
      if (
        line.includes('"err"') ||
        line.toLowerCase().includes('error') ||
        line.toLowerCase().includes('exception')
      ) {
        markers.push({
          startLineNumber: i + 1,
          endLineNumber: i + 1,
          startColumn: 0,
          endColumn: model.getLineMaxColumn(i + 1),
          message: 'error?',
          severity: monacoInstance.MarkerSeverity.Error,
        })
      }
    }
    // Note: Using monaco from useMonaco() here breaks if you navigate away and back
    monacoInstance.editor.setModelMarkers(model, 'highlightErrorLogs', markers)
  }

  const highlightYamlErrors = (newData: string | undefined) => {
    const monacoInstance = monacoInstanceRef.current
    if (!monacoInstance || !editorRef.current || newData === undefined) {
      return
    }
    const model = editorRef.current.getModel()
    if (!model) return

    const markers: monaco.editor.IMarkerData[] = []

    try {
      yaml.parse(newData)
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

    monacoInstance.editor.setModelMarkers(model, 'highlightYamlErrors', markers)
  }

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco,
  ) => {
    editorRef.current = editor
    monacoInstanceRef.current = monacoInstance
    highlightErrorLogs(data)
    if (autoScrollToBottom) scrollToBottom()
  }

  const handleEditorChange = (newData: string | undefined) => {
    if (!readOnly) highlightYamlErrors(newData)

    highlightErrorLogs(newData)

    onChange?.(newData)
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
            renderValidationDecorations: 'on',
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none', // overflow through placeholder when turned on
            placeholder,
          }}
        />
      </Suspense>
    </div>
  )
}
