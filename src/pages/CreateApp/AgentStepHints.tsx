import { type FC } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { ChevronRight, HelpCircle } from 'lucide-react'
import xAgentDocs from '../../../templates/x-agent/README.md?raw'
import tbotDocs from '../../../templates/tgbot/README.md?raw'
import hlCopyTraderDocs from '../../../templates/hl-copy-trader/README.md?raw'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'

type AgentStepHintsProps = {
  selectedTemplateId?: string
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

export const AgentStepHints: FC<AgentStepHintsProps> = ({
  selectedTemplateId,
  isExpanded,
  setIsExpanded,
}) => {
  console.log('selectedTemplateId', selectedTemplateId)
  const getMarkdownForTemplate = (templateId: string) => {
    switch (templateId) {
      case 'tgbot':
        return tbotDocs
      case 'x-agent':
        return xAgentDocs
      case 'hl-copy-trader':
        return hlCopyTraderDocs
      default:
        return ''
    }
  }

  if (!selectedTemplateId) {
    return null
  }

  const markdown = getMarkdownForTemplate(selectedTemplateId)

  if (!markdown) {
    return null
  }

  return (
    <>
      <div className="fixed right-0 top-16 h-[calc(100vh-8rem)] z-1 flex">
        <div
          className={`bg-background border-l border-border transition-transform duration-300 ease-in-out flex flex-col w-[380px] ${
            isExpanded ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
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
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn('z-2 absolute top-0 right-0 transition-all duration-300', {
          'opacity-0 pointer-events-none': isExpanded,
          'opacity-100': !isExpanded,
        })}
      >
        Need help?
      </Button>
    </>
  )
}
