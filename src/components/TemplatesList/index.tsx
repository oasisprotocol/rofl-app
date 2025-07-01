import { type FC } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@oasisprotocol/ui-library/src/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { templates } from '../../pages/CreateApp/templates'

type TemplatesListProps = {
  handleTemplateSelect?: (templateId: string) => void
}

export const TemplatesList: FC<TemplatesListProps> = ({ handleTemplateSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <Card key={template.id} className="rounded-md pt-6 flex flex-col">
          <div className="rounded-t-md h-[160px] -mt-6">
            <img
              src={template.image}
              alt={template.name}
              className="w-full h-full object-cover rounded-t-md"
            />
          </div>
          <CardHeader className="gap-0">
            <CardTitle className="text-white text-lg">{template.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <span className="text-muted-foreground text-sm">
              {template.description || 'No description available.'}
            </span>
          </CardContent>
          {handleTemplateSelect && (
            <CardFooter>
              <Button className="w-full" onClick={() => handleTemplateSelect(template.id)}>
                Select
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
      <Card className="border-0 rounded-md">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
          <span className="text-muted-foreground text-lg font-semibold">Custom build</span>
          <span className="text-muted-foreground text-sm">
            Convert your containerized app into a trustless app in minutes via Oasis CLI.
            <br />
            <Button variant="secondary" asChild className="mt-4">
              <a
                href="https://docs.oasis.io/build/rofl/quickstart/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center justify-center">
                  <span>Read our Docs</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </span>
              </a>
            </Button>
          </span>
        </CardContent>
      </Card>
      <Card className="border-0 rounded-md">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
          <span className="text-muted-foreground text-lg font-semibold">More coming soon...</span>
        </CardContent>
      </Card>
      {/* if there is not a multiple of 3 templates (including 2 static cards) add a semi transparent card  */}
      {(templates.length + 2) % 3 !== 0 && (
        <Card className="border-0 rounded-md rounded-lg bg-gradient-to-r from-card to-transparent"></Card>
      )}
    </div>
  )
}
