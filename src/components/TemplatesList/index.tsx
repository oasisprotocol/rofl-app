import { type FC } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@oasisprotocol/ui-library/src/components/ui/card'
import { Plus } from 'lucide-react'
import { templates } from '../../pages/CreateApp/templates'

type TemplatesListProps = {
  handleTemplateSelect?: (templateId: string) => void
}

export const TemplatesList: FC<TemplatesListProps> = ({ handleTemplateSelect }) => {
  let customTemplate = null
  const filteredTemplates = []

  for (const template of templates) {
    if (template.id === 'custom-build') {
      customTemplate = template
    } else {
      filteredTemplates.push(template)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {customTemplate && (
          <Card className="border-0 rounded-md">
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
              <CardHeader className="mt-2 mb-0 w-full">
                <CardTitle className="text-white text-lg">{customTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="flex flex-col gap-4 text-muted-foreground text-sm">
                  {customTemplate.description}
                  {handleTemplateSelect && (
                    <span>
                      <Button onClick={() => handleTemplateSelect(customTemplate.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </span>
                  )}
                </span>
              </CardContent>
            </div>
          </Card>
        )}

        {filteredTemplates.map(template => (
          <Card key={template.id} className="rounded-md pt-6 flex flex-col gap-4">
            <div className="rounded-t-md h-[160px] -mt-6">
              {handleTemplateSelect ? (
                <Button
                  className="p-0 rounded-t-md rounded-b-none w-full h-full"
                  variant="ghost"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </Button>
              ) : (
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover rounded-t-md"
                />
              )}
            </div>
            <div>
              <CardHeader className="mt-2">
                <CardTitle className="text-white text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <span className="text-muted-foreground text-sm">
                  {template.description || 'No description available.'}
                </span>
              </CardContent>
            </div>
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
          <a href="https://forms.gle/ctNi6FcZK6VXQucL7" target="_blank" rel="noopener noreferrer">
            Suggest an Idea
          </a>
        </Button>
      </div>
    </div>
  )
}
