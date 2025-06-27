import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { type FC, lazy, Suspense } from 'react'

const TextAreaFallback = ({ value }: { value?: string }) => (
  <textarea readOnly value={value} className="w-full h-full bg-background text-foreground overflow-hidden" />
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
}

const CodeDisplay: FC<CodeDisplayProps> = ({ data, className }) => {
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
          options={{
            readOnly: true,
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </Suspense>
    </div>
  )
}

type RawCodeProps = {
  data: string | undefined
  className?: string
}

export const RawCode: FC<RawCodeProps> = ({ data, className }) => {
  if (!data) return null

  return <CodeDisplay data={data} className={className} />
}
