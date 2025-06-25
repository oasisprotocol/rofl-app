import { useEffect, useState, type FC } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@oasisprotocol/ui-library/src/components/ui/tabs'
import { AppStatusIcon } from '../../../components/AppStatusIcon'
import { AppMetadata } from './AppMetadata'
import { AppSecrets } from './AppSecrets'
import { useGetRuntimeRoflAppsId, type RoflAppMetadata, type RoflAppSecrets } from '../../../nexus/api'
import { useNetwork } from '../../../hooks/useNetwork'
import { useParams } from 'react-router-dom'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { trimLongString } from '../../../utils/trimLongString'
import { type ViewMetadataState, type ViewSecretsState } from './types'
import { useDownloadArtifact, useRemoveApp } from '../../../backend/api'
import { useRoflAppBackendAuthContext } from '../../../contexts/RoflAppBackendAuth/hooks'
import { AppArtifacts } from './AppArtifacts'
import { UnsavedChanges } from './UnsavedChanges'
import { Trash2 } from 'lucide-react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'

function setDefaultMetadataViewState(metadata: RoflAppMetadata | undefined = {}): ViewMetadataState {
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
  }
}

function setDefaultSecretsViewState(secrets: RoflAppSecrets | undefined = {}): ViewSecretsState {
  return {
    isDirty: false,
    secrets: {
      ...secrets,
    },
  }
}

export const AppDetails: FC = () => {
  const [viewMetadataState, setViewMetadataState] = useState({
    ...setDefaultMetadataViewState(),
  })
  const [viewSecretsState, setViewSecretsState] = useState({
    ...setDefaultSecretsViewState(),
  })
  const network = useNetwork()
  const { id } = useParams()
  const roflAppQuery = useGetRuntimeRoflAppsId(network, 'sapphire', id!)
  const { data, isLoading, isFetched } = roflAppQuery
  const roflApp = data?.data
  const { token } = useRoflAppBackendAuthContext()
  const roflArtifact = useDownloadArtifact(`${id}-rofl-yaml`, token)
  const composeArtifact = useDownloadArtifact(`${id}-compose-yaml`, token)
  const editEnabled = !!token && !!roflArtifact.data && !!composeArtifact.data
  const { mutateAsync: removeApp } = useRemoveApp()

  useEffect(() => {
    if (roflApp) {
      setViewMetadataState({
        ...setDefaultMetadataViewState(roflApp.metadata),
      })
      setViewSecretsState({ ...setDefaultSecretsViewState(roflApp.secrets) })
    }
  }, [roflApp])

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
        <>
          <UnsavedChanges
            isDirty={viewMetadataState.isDirty || viewSecretsState.isDirty}
            onDiscard={() => {
              setViewMetadataState({
                ...setDefaultMetadataViewState(roflApp.metadata),
              })
              setViewSecretsState({
                ...setDefaultSecretsViewState(roflApp.secrets),
              })
            }}
            onConfirm={() => {
              setViewMetadataState(prev => ({
                ...prev,
                isDirty: false,
              }))
              setViewSecretsState(prev => ({
                ...prev,
                isDirty: false,
              }))
              roflAppQuery.refetch()
            }}
          />
          <div>
            <Tabs defaultValue="details">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b py-5 mb-5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    <>{viewMetadataState.metadata.name || trimLongString(roflApp.id)}</>
                  </h1>
                  <AppStatusIcon hasActiveInstances removed={false} />
                </div>
                <div className="flex items-center gap-8">
                  {!roflApp?.removed && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeApp({ appId: id as `rofl1${string}`, network })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <TabsList className="w-full md:w-auto">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="secrets">Secrets</TabsTrigger>
                      <TabsTrigger value="compose">Compose</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
              <TabsContent value="details">
                <AppMetadata
                  id={roflApp.id}
                  editableState={viewMetadataState.metadata}
                  policy={roflApp.policy}
                  setViewMetadataState={setViewMetadataState}
                  editEnabled={editEnabled}
                />
              </TabsContent>
              <TabsContent value="secrets">
                <AppSecrets
                  secrets={viewSecretsState.secrets}
                  setViewSecretsState={setViewSecretsState}
                  editEnabled={editEnabled}
                />
              </TabsContent>
              <TabsContent value="compose">
                <AppArtifacts
                  isFetched={roflArtifact.isFetched && composeArtifact.isFetched}
                  roflYaml={roflArtifact.data}
                  composeYaml={composeArtifact.data}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </>
  )
}
