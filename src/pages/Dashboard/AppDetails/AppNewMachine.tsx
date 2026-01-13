import { type FC } from 'react'
import { useNetwork } from '../../../hooks/useNetwork'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton.tsx'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { BuildForm } from '../../../components/BuildForm'
import { CreateFormNavigation } from '../../CreateApp/CreateFormNavigation.tsx'
import { useDeployAppToNewMachine, useDownloadArtifact } from '../../../backend/api.ts'
import { useRoflAppBackendAuthContext } from '../../../contexts/RoflAppBackendAuth/hooks.ts'
import * as yaml from 'yaml'
import { defaultBuildConfig } from '../../CreateApp/templates.tsx'
import { Steps } from '../../CreateApp/AnimatedStepText.tsx'
import { useAccount } from 'wagmi'

export const AppNewMachine: FC = () => {
  const { address } = useAccount()
  const navigate = useNavigate()
  const network = useNetwork()
  const { id } = useParams()
  const { token } = useRoflAppBackendAuthContext()
  const roflTemplateQuery = useDownloadArtifact(`${id}-rofl-template-yaml`, token)
  let roflTemplateYaml: ReturnType<typeof yaml.parse> | undefined
  if (roflTemplateQuery.data) {
    try {
      roflTemplateYaml = yaml.parse(roflTemplateQuery.data)
    } catch (e) {
      roflTemplateYaml = undefined
    }
  }

  const deployAppToNewMachineMutation = useDeployAppToNewMachine()

  const handleBack = () => {
    navigate(`..`)
  }

  const isLoading = roflTemplateQuery.isLoading
  const isFetched = roflTemplateQuery.isFetched
  if (!token) return <div>Missing token</div>
  if (!roflTemplateYaml || typeof roflTemplateYaml !== 'object' || !roflTemplateYaml.resources)
    return <div>Missing rofl-template.yaml</div>
  return (
    <div>
      <div className="flex pl-6 pt-6 pr-3">
        <Button variant="ghost" className="flex items-center gap-2 !p-0 h-auto" onClick={handleBack}>
          <>
            <ChevronLeft className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Back to app details</span>
          </>
        </Button>
      </div>
      {isLoading && <Skeleton className="w-full h-[36px]" />}
      {isFetched && address && deployAppToNewMachineMutation.status === 'idle' && (
        <div className="py-6 px-6">
          <div className="flex flex-col">
            <div className="flex flex-col items-start gap-2 max-w-md">
              <h1 className="text-2xl font-semibold text-foreground">Rent new machine</h1>
              <p className="text-sm text-muted-foreground mb-2">Machine rental costs are non-refundable.</p>
              <BuildForm
                build={defaultBuildConfig}
                selectedTemplateRequirements={{
                  tee: roflTemplateYaml.tee as 'tdx' | 'sgx' | undefined,
                  cpus: roflTemplateYaml.resources.cpus as number | undefined,
                  memory: roflTemplateYaml.resources.memory as number | undefined,
                  storage: roflTemplateYaml.resources.storage?.size as number | undefined,
                }}
                onSubmit={async build => {
                  await deployAppToNewMachineMutation.mutateAsync({
                    appId: id as `rofl1${string}`,
                    token,
                    network,
                    build,
                    address: address,
                  })
                  // Wait for allowNavigatingAway
                  await new Promise(r => setTimeout(r, 10))
                  handleBack()
                }}
              >
                {({ noOffersWarning }) => {
                  return (
                    <CreateFormNavigation
                      handleBack={handleBack}
                      disabled={deployAppToNewMachineMutation.isPending || noOffersWarning}
                      isLoading={deployAppToNewMachineMutation.isPending}
                    />
                  )
                }}
              </BuildForm>
            </div>
          </div>
        </div>
      )}
      {deployAppToNewMachineMutation.status !== 'idle' && (
        <Steps
          progress={deployAppToNewMachineMutation.progress}
          bootstrapStep={deployAppToNewMachineMutation.status}
        />
      )}
    </div>
  )
}
