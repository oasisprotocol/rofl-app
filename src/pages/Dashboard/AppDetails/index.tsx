import { useEffect, useState, type FC } from 'react'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@oasisprotocol/ui-library/src/components/ui/tabs'
import { AppStatusIcon } from '../../../components/AppStatusIcon'
import { AppMetadata } from './AppMetadata'
import { SecretsTable } from '../../../components/SecretsTable'
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
import { HelpWidget } from '../../CreateApp/HelpWidget'
import { AddSecret } from '../../../components/SecretsTable/AddSecret'
import { useAccount } from 'wagmi'

function setDefaultMetadataViewState(metadata: RoflAppMetadata | undefined = {}): ViewMetadataState {
  return {
    isDirty: false,
    metadata: {
      name: (metadata['net.oasis.rofl.name'] as string) || '',
      author: (metadata['net.oasis.rofl.author'] as string) || '',
      description: (metadata['net.oasis.rofl.description'] as string) || '',
      version: (metadata['net.oasis.rofl.version'] as string) || '',
      homepage: (metadata['net.oasis.rofl.homepage'] as string) || '',
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
  const account = useAccount()
  const [viewMetadataState, setViewMetadataState] = useState({
    ...setDefaultMetadataViewState(),
  })
  const [viewSecretsState, setViewSecretsState] = useState({
    ...setDefaultSecretsViewState(),
  })
  const [isHelpPanelExpanded, setIsHelpPanelExpanded] = useState(false)
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
  const { data: readme } = useDownloadArtifact(`${id}-readme-md`, token)

  const editEnabled = !!token && !roflApp?.removed && roflApp?.admin_eth === account.address
  const removeApp = useRemoveApp()
  const updateApp = useUpdateApp()

  const showBlockingOverlay = removeApp.isPending || updateApp.isPending

  const handleAddSecret = (key: string, value: string) => {
    if (!roflApp?.sek) return

    const secretValue = oasisRT.rofl.encryptSecret(
      key,
      oasis.misc.fromString(value),
      oasis.misc.fromBase64(roflApp.sek),
    )

    const updatedSecrets = { ...viewSecretsState.secrets, [key]: secretValue }
    setViewSecretsState({
      isDirty: true,
      secrets: updatedSecrets,
    })
  }

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
            <DialogContent className="w-auto [&>button]:hidden">
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
                      disabled={!editEnabled}
                      stakedAmount={roflApp.stake}
                      onConfirm={async () => {
                        if (roflApp.metadata['net.oasis.roflapp.template'] === 'hl-copy-trader') {
                          if (!window.confirm('Did you withdraw funds from trading account?')) return
                        }

                        await removeApp.mutateAsync({ appId: id as `rofl1${string}`, network })
                        roflAppQuery.refetch()
                      }}
                    />
                  )}

                  <div className="flex flex-wrap gap-3">
                    <TabsList className="w-full md:w-auto">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="secrets">Secrets</TabsTrigger>
                      <TabsTrigger value="compose">Manifest</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
              <TabsContent value="details">
                <AppMetadata
                  id={roflApp.id}
                  date_created={roflApp.date_created}
                  editableState={viewMetadataState.metadata}
                  policy={roflApp.policy}
                  setViewMetadataState={setViewMetadataState}
                  editEnabled={editEnabled}
                />
              </TabsContent>
              <TabsContent value="secrets" className="relative pt-10">
                <HelpWidget
                  markdown={readme}
                  isExpanded={isHelpPanelExpanded}
                  setIsExpanded={setIsHelpPanelExpanded}
                ></HelpWidget>
                <SecretsTable
                  appSek={roflApp.sek}
                  secrets={viewSecretsState.secrets}
                  setViewSecretsState={setViewSecretsState}
                  editEnabled={editEnabled}
                />
                <AddSecret disabled={!editEnabled} handleAddSecret={handleAddSecret} />
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
