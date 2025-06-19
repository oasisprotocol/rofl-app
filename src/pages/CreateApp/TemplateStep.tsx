import { type FC } from 'react';
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout';
import { Header } from '../../components/Layout/Header';
import { Footer } from '../../components/Layout/Footer';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import type { MetadataFormData, TemplateFormData } from './types';
import { templates } from './templates';

type TemplateStepProps = {
  handleNext: () => void;
  setAppDataForm: (
    data: Partial<{
      template: TemplateFormData;
      metadata: Partial<MetadataFormData>;
    }>
  ) => void;
};

export const TemplateStep: FC<TemplateStepProps> = ({
  handleNext,
  setAppDataForm,
}) => {
  const handleTemplateSelect = (id: string) => {
    const template = templates.find((template) => template.id === id);
    setAppDataForm({
      template: id,
      metadata: {
        ...template?.initialValues.metadata,
      },
    });
    handleNext();
  };

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-2xl font-white font-bold mb-2">
              Start by Selecting a Template
            </h1>
            <p className="text-muted-foreground text-md max-w-md">
              At varius sit sit netus at integer vitae posuere id. Nulla
              imperdiet vestibulum amet ultrices egestas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="rounded-md pt-6 flex flex-col">
                <div className="rounded-t-md h-[160px] -mt-6">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </div>
                <CardHeader className="gap-0">
                  <CardTitle className="text-white text-lg">
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <span className="text-muted-foreground text-sm">
                    {template.description || 'No description available.'}
                  </span>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    Select
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className="border-0 rounded-md">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-2">
                <span className="text-muted-foreground text-lg font-semibold">
                  New Templates soon
                </span>
                <span className="text-muted-foreground text-sm">
                  Quis id donec platea phasellus orci purus at. Sollicitudin
                  lacus morbi est iaculis aliquam.
                </span>
              </CardContent>
            </Card>
            {/* if there is not a multiple of 3 templates (including new template soon) add a semi transparent card  */}
            {(templates.length + 1) % 3 !== 0 && (
              <Card className="border-0 rounded-md rounded-lg bg-gradient-to-r from-card to-transparent"></Card>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
};
