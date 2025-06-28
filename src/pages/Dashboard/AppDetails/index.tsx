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
import { useDownloadArtifact, useRemoveApp, useUpdateApp } from '../../../backend/api'
import { useRoflAppBackendAuthContext } from '../../../contexts/RoflAppBackendAuth/hooks'
import { AppArtifacts } from './AppArtifacts'
import { UnsavedChanges } from './UnsavedChanges'
import { RemoveAppButton } from './RemoveAppButton'
import { Dialog, DialogContent } from '@oasisprotocol/ui-library/src/components/ui/dialog'

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
  const { isFetched: isRoflYamlFetched, data: roflYaml } = useDownloadArtifact(`${id}-rofl-yaml`, token)
  const { isFetched: isComposeYamlFetched, data: composeYaml } = useDownloadArtifact(
    `${id}-compose-yaml`,
    token,
  )
  const editEnabled = !!token && !roflApp?.removed
  const removeApp = useRemoveApp()
  const updateApp = useUpdateApp()

  const showBlockingOverlay = removeApp.isPending || updateApp.isPending

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
          <Dialog open={showBlockingOverlay}>
            <DialogContent className="w-auto">
              {/* mitigate webm black background */}
              <video className="mix-blend-lighten" width="310" height="310" autoPlay muted loop playsInline>
                <source src="https://assets.oasis.io/webm/Oasis-Loader-310x310.webm" type="video/webm" />
              </video>
            </DialogContent>
          </Dialog>
          <UnsavedChanges
            isDirty={viewMetadataState.isDirty || viewSecretsState.isDirty}
            applyLabel={viewSecretsState.isDirty ? 'Apply and Restart Machine' : 'Apply'}
            onDiscard={() => {
              setViewMetadataState({
                ...setDefaultMetadataViewState(roflApp.metadata),
              })
              setViewSecretsState({
                ...setDefaultSecretsViewState(roflApp.secrets),
              })
            }}
            onConfirm={async () => {
              await updateApp.mutateAsync({
                appId: id as `rofl1${string}`,
                metadataViewState: viewMetadataState,
                secretsViewState: viewSecretsState,
                network,
              })
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
                  <AppStatusIcon
                    hasActiveInstances={!!roflApp.num_active_instances}
                    removed={roflApp.removed}
                  />
                </div>
                <div className="flex items-center gap-8">
                  {roflApp && !roflApp?.removed && (
                    <RemoveAppButton
                      stakedAmount={roflApp.stake}
                      onConfirm={async () => {
                        await removeApp.mutateAsync({ appId: id as `rofl1${string}`, network })
                        roflAppQuery.refetch()
                      }}
                    />
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
                  appSek={roflApp.sek}
                  secrets={viewSecretsState.secrets}
                  setViewSecretsState={setViewSecretsState}
                  editEnabled={editEnabled}
                />
              </TabsContent>
              <TabsContent value="compose">
                <AppArtifacts
                  isFetched={isRoflYamlFetched && isComposeYamlFetched}
                  roflYaml={roflYaml}
                  composeYaml={composeYaml}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </>
  )
}
