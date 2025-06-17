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
import Empyreal from './images/empyreal.svg';

type TemplateStepProps = {
  handleNext: () => void;
};

export const TemplateStep: FC<TemplateStepProps> = ({ handleNext }) => {
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
            <Card className="rounded-md pt-6">
              <div className="rounded-t-md bg-black -mt-6 flex items-center justify-center">
                <img src={Empyreal} alt="Empyreal" className="w-full" />
              </div>
              <CardHeader className="gap-0">
                <CardTitle className="text-white text-lg">Empyreal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <span className="text-muted-foreground text-sm">
                  Multi-agent simulation framework designed for creating,
                  deploying, and managing AI agents across different platforms.
                </span>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleNext}>
                  Select
                </Button>
              </CardFooter>
            </Card>
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
            <Card className="border-0 rounded-md rounded-lg bg-gradient-to-r from-card to-transparent"></Card>
          </div>
        </div>
      </Layout>
    </div>
  );
};
