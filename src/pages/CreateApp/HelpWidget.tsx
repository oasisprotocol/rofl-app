import { type FC } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { ChevronRight, HelpCircle } from 'lucide-react'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { getReadmeByTemplateId } from './templates'

type HelpWidgetProps = {
  selectedTemplateId?: string
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

export const HelpWidget: FC<HelpWidgetProps> = ({ selectedTemplateId, isExpanded, setIsExpanded }) => {
  if (!selectedTemplateId) {
    return null
  }

  const markdown = getReadmeByTemplateId(selectedTemplateId)

  if (!markdown) {
    return null
  }

  return (
    <>
      <div
        className={cn('right-0 top-26 md:top-16 h-[calc(100vh-8rem)] flex', !isExpanded ? 'hidden' : 'fixed')}
      >
        <div className="bg-background border-l border-border transition-transform duration-300 ease-in-out flex flex-col w-[min(380px,100vw)]">
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Template Guide</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0 hover:bg-muted"
              title="Close panel"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* prose classes https://github.com/tailwindlabs/tailwindcss-typography */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn('absolute top-0 right-0 transition-all duration-300', {
          'opacity-0 pointer-events-none': isExpanded,
          'opacity-100': !isExpanded,
        })}
      >
        Need help?
      </Button>
    </>
  )
}
