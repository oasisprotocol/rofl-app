import { type FC } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@oasisprotocol/ui-library/src/components/ui/dialog'
import xAgentDocs from '../../../templates/x-agent/README.md?raw'
import tbotDocs from '../../../templates/tgbot/README.md?raw'
import hlCopyTraderDocs from '../../../templates/hl-copy-trader/README.md?raw'

type AgentStepHintsProps = {
  selectedTemplateId?: string
}

export const AgentStepHints: FC<AgentStepHintsProps> = ({ selectedTemplateId }) => {
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
  return (
    <>
      {markdown && (
        <>
          Looking for more information? Check out the docs provided by the template authors.
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full mt-6">
                README.MD
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
              <DialogTitle></DialogTitle>
              <DialogHeader>
                <DialogTitle>README.md</DialogTitle>
                <DialogDescription>Docs provided by the template authors.</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
