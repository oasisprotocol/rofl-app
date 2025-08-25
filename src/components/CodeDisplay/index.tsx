import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { type FC, lazy, Suspense } from 'react'

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
  if (!data) {
    return null
  }

  return (
    <div className={cn('flex-1 h-[550px] overflow-auto resize-y', className)}>
      <Suspense fallback={<TextAreaFallback value={data} />}>
        <MonacoEditor
          loading={<TextAreaFallback value={data} />}
          language="yaml"
          value={data}
          theme="vs-dark"
          onChange={onChange}
          options={{
            readOnly,
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </Suspense>
    </div>
  )
}
