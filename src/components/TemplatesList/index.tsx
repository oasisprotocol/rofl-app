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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-0 rounded-md">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
            <CardTitle className="text-white text-lg">Custom Build</CardTitle>
            <span className="flex flex-col gap-4 text-muted-foreground text-sm">
              Convert your containerized app into a trustless app in minutes via Oasis CLI.
              <span>
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
            </span>
          </CardContent>
        </Card>

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
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  Select
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center p-6 border rounded-lg gap-4">
        <div className="flex flex-col items-center gap-2 w-full">
          <h3 className="text-card-foreground text-base font-semibold">Got your own ideas?</h3>
          <p className="text-muted-foreground text-sm">
            Contact us and suggest it so we can work with you implementing it.
          </p>
        </div>

        <Button variant="outline" asChild>
          <a href="mailto:#">Send E-mail</a>
        </Button>
      </div>
    </div>
  )
}
