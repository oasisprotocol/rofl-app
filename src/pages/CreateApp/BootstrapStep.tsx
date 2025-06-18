import { type FC } from 'react';
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout';
import { Header } from '../../components/Layout/Header';
import { Footer } from '../../components/Layout/Footer';
import Bootstrap from './images/bootstrap.png';
import type { AppData } from './types';

type BootstrapStepProps = {
  appData?: AppData;
};

export const BootstrapStep: FC<BootstrapStepProps> = ({ appData }) => {
  console.log(JSON.stringify(appData, null, 2));

  return (
    <Layout headerContent={<Header />} footerContent={<Footer />}>
      <div className="w-full px-8 py-12 flex flex-col items-center justify-center">
        <img
          src={Bootstrap}
          alt="Bootstrap"
          className="w-[250px] h-auto mb-8"
        />
        <div className="mb-8">
          <h1 className="text-2xl font-white font-bold mb-2 text-center">
            ROFL App Registration...
          </h1>
          <p className="text-muted-foreground text-md max-w-md text-center">
            At varius sit sit netus at integer vitae posuere id. Nulla imperdiet
            vestibulum amet ultrices egestas. Bibendum sed integer ac eget.
          </p>
        </div>
      </div>
    </Layout>
  );
};
