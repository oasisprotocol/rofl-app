import { type FC, useEffect } from 'react';
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout';
import { Header } from '../../components/Layout/Header';
import { Footer } from '../../components/Layout/Footer';
import Bootstrap from './images/bootstrap.png';
import type { AppData, MetadataFormData } from './types';
import { stringify } from 'yaml';
import { useUploadArtifact } from '../../backend/api';
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks';

type BootstrapStepProps = {
  appData?: AppData;
  parser?: (metadata: MetadataFormData) => unknown;
};

export const BootstrapStep: FC<BootstrapStepProps> = ({ appData, parser }) => {
  if (!appData?.metadata || !parser) {
    throw new Error('App data or metadata is not provided');
  }
  const appConfig = parser(appData.metadata);
  const stringifiedYaml = stringify(appConfig);
  const { token } = useRoflAppBackendAuthContext();
  const uploadArtifactMutation = useUploadArtifact(token);

  useEffect(() => {
    if (appData.template && stringifiedYaml) {
      uploadArtifactMutation.mutate({
        id: appData.template,
        content: stringifiedYaml,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData.template, stringifiedYaml]);

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
