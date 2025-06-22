import { useEffect, useState, type FC } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/tabs';
import { AppStatusIcon } from '../../../components/AppStatusIcon';
import { YamlCode } from '../../../components/CodeDisplay';
import { AppMetadata } from './AppMetadata';
import { AppSecrets } from './AppSecrets';
import {
  useGetRuntimeRoflAppsId,
  type RoflAppMetadata,
  type RoflAppSecrets,
} from '../../../nexus/api';
import { useNetwork } from '../../../hooks/useNetwork';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { trimLongString } from '../../../utils/trimLongString';
import { type ViewMetadataState, type ViewSecretsState } from './types';
import { DiscardChanges } from './DiscardButton';
import { ApplyChanges } from './ApplyChanges';

function setDefaultMetadataViewState(
  metadata: RoflAppMetadata | undefined = {}
): ViewMetadataState {
  return {
    isDirty: false,
    metadata: {
      name: (metadata['net.oasis.rofl.name'] as string) || '',
      author: (metadata['net.oasis.rofl.author'] as string) || '',
      description: (metadata['net.oasis.rofl.description'] as string) || '',
      version: (metadata['net.oasis.rofl.version'] as string) || '',
      homepage: (metadata['net.oasis.rofl.homepage'] as string) || '',
      license: (metadata['net.oasis.rofl.license'] as string) || '',
    },
  };
}

function setDefaultSecretsViewState(
  secrets: RoflAppSecrets | undefined = {}
): ViewSecretsState {
  return {
    isDirty: false,
    secrets: {
      ...secrets,
    },
  };
}

export const AppDetails: FC = () => {
  const [viewMetadataState, setViewMetadataState] = useState({
    ...setDefaultMetadataViewState(),
  });
  const [viewSecretsState, setViewSecretsState] = useState({
    ...setDefaultSecretsViewState(),
  });
  const network = useNetwork();
  const { id } = useParams();
  const roflAppQuery = useGetRuntimeRoflAppsId(network, 'sapphire', id!);
  const { data, isLoading, isFetched } = roflAppQuery;
  const roflApp = data?.data;

  useEffect(() => {
    if (roflApp) {
      setViewMetadataState({
        ...setDefaultMetadataViewState(roflApp.metadata),
      });
      setViewSecretsState({ ...setDefaultSecretsViewState(roflApp.secrets) });
    }
  }, [roflApp]);

  return (
    <>
      {isLoading && (
        <div>
          <Skeleton className="w-full h-[60px] mb-6" />
          <Skeleton className="w-full h-[40px] mb-6" />
          <Skeleton className="w-full h-[40px] mb-6" />
          <Skeleton className="w-full h-[200px] mb-6" />
          <Skeleton className="w-full h-[40px] mb-6" />
        </div>
      )}
      {isFetched && roflApp && (
        <div>
          <Tabs defaultValue="details">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b py-5 mb-5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  <>
                    {viewMetadataState.metadata.name ||
                      trimLongString(roflApp.id)}
                  </>
                </h1>
                <AppStatusIcon hasActiveInstances removed={false} />
              </div>
              <div className="flex flex-wrap gap-3">
                <DiscardChanges
                  disabled={
                    !viewMetadataState.isDirty && !viewSecretsState.isDirty
                  }
                  onConfirm={() => {
                    setViewMetadataState({
                      ...setDefaultMetadataViewState(roflApp.metadata),
                    });
                    setViewSecretsState({
                      ...setDefaultSecretsViewState(roflApp.secrets),
                    });
                  }}
                />
                <ApplyChanges
                  disabled={
                    !viewMetadataState.isDirty && !viewSecretsState.isDirty
                  }
                  onConfirm={() => {
                    setViewMetadataState((prev) => ({
                      ...prev,
                      isDirty: false,
                    }));
                    setViewSecretsState((prev) => ({
                      ...prev,
                      isDirty: false,
                    }));
                    roflAppQuery.refetch();
                  }}
                />
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="secrets">Secrets</TabsTrigger>
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="details">
              <AppMetadata
                id={roflApp.id}
                editableState={viewMetadataState.metadata}
                policy={roflApp.policy}
                setViewMetadataState={setViewMetadataState}
              />
            </TabsContent>
            <TabsContent value="secrets">
              <AppSecrets
                secrets={viewSecretsState.secrets}
                setViewSecretsState={setViewSecretsState}
              />
            </TabsContent>
            <TabsContent value="compose">
              <YamlCode
                data={`
                services:
                ollama:
                image: "docker.io/ollama/ollama"
                ports:
                - "11434:11434"
                volumes:
                - ~/ollama-storage:/root/.ollama
                entrypoint: ["/usr/bin/bash", "-c", "/bin/ollama serve & sleep 5; ollama pull deepseek-r1:1.5b; wait"]
                
                sapphire-localnet:
                image: "ghcr.io/oasisprotocol/sapphire-localnet"
                platform: "linux/x86_64"
                ports:
                - "8544-8548:8544-8548"
                healthcheck:
      test: ["CMD", "test", "-f", "/CONTAINER_READY"]
      interval: 30s
      timeout: 10s
      retries: 20
      
      contracts:
      image: "ghcr.io/foundry-rs/foundry:latest"
      volumes:
      - ./contracts:/contracts
      entrypoint: /bin/sh -c 'cd contracts && forge create --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --rpc-url http://sapphire-localnet:8545 --broadcast ChatBot --constructor-args localhost 00d795c033fb4b94873d81b6327f5371768ffc6fcf 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
      depends_on:
      sapphire-localnet:
      condition: service_healthy
      
      oracle:
      environment:
      CONTRACT_ADDRESS: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    build:
      dockerfile: Dockerfile.oracle
      #    entrypoint: /bin/sh -c 'python main.py --network http://sapphire-localnet:8545 --ollama-address http://ollama:11434 --secret 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 $$CONTRACT_ADDRESS'
      entrypoint: /bin/sh -c 'sleep 100; python main.py --network http://sapphire-localnet:8545 --ollama-address http://ollama:11434 --secret 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 0x5FbDB2315678afecb367f032d93F642f64180aa3'
      restart: on-failure
      depends_on:
      contracts:
      condition: service_completed_successfully
      
      frontend:
      build:
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:5173"
      depends_on:
      contracts:
      condition: service_completed_successfully
      
      `}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};
