import axios from 'axios'
import type { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Template } from '../pages/CreateApp/BootstrapStep'
import type { AppData } from '../pages/CreateApp/types'
import * as yaml from 'yaml'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'
import { GetRuntimeEvents, GetRuntimeRoflmarketInstances, RoflMarketInstance } from '../nexus/api'
import { useConfig, useSendTransaction } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { ViewMetadataState, ViewSecretsState } from '../pages/Dashboard/AppDetails/types'
import { useState } from 'react'
import { useBlockNavigatingAway } from '../pages/CreateApp/useBlockNavigatingAway'
import { BuildFormData } from '../types/build-form.ts'
import { convertToDurationTerms } from './helpers.ts'
import { toastWithDuration } from '../utils/toastWithDuration.tsx'
import { getReadmeByTemplateId, fillTemplate } from '../pages/CreateApp/templates.tsx'
import { toast } from 'sonner'
import { isMachineRemoved } from '../components/MachineStatusIcon/isMachineRemoved.ts'
import { trackEvent } from 'fathom-client'
import { getOasisAddressBytesFromEvm } from '../utils/helpers.ts'

const BACKEND_URL = import.meta.env.VITE_ROFL_APP_BACKEND

type NonceResponse = {
  nonce: string
}

type LoginResponse = {
  token: string
}

type LoginRequest = {
  message: string
  signature: string
}

type MeResponse = {
  address: string
  [key: string]: unknown
}

type RoflBuildRequest = {
  manifest: string
  compose: string
}

type RoflBuildResponse = {
  task_id: string
}

type RoflBuildResultsResponse = {
  manifest: string | null
  oci_reference: string
  manifest_hash: string
  logs: string
  err: string
  enclaves: null | oasis.types.SGXEnclaveIdentity[] // Added in postprocessing
}

type RoflValidateResponse = {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  message?: string
}

type ArtifactId =
  | `${string}-rofl-template-yaml`
  | `${string}-rofl-yaml`
  | `${string}-compose-yaml`
  | `${string}-readme-md`

type ArtifactUploadRequest = {
  id: ArtifactId
  file: File | Blob
}

type ArtifactDownloadResponse = string

export const fetchNonce = async (address: string): Promise<string> => {
  const response = await axios.get<NonceResponse>(`${BACKEND_URL}/auth/nonce`, {
    params: { address },
  })
  return response.data.nonce
}

export const login = async ({ message, signature }: LoginRequest): Promise<string> => {
  const response = await axios.post<LoginResponse>(
    `${BACKEND_URL}/auth/login`,
    { message },
    {
      params: { sig: signature },
      headers: { 'Content-Type': 'application/json' },
    },
  )
  return response.data.token
}

const fetchMe = async (token: string): Promise<MeResponse> => {
  const response = await axios.get<MeResponse>(`${BACKEND_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

const buildRofl = async (
  { manifest, compose }: RoflBuildRequest,
  token: string,
): Promise<RoflBuildResponse> => {
  const response = await axios.post<RoflBuildResponse>(
    `${BACKEND_URL}/rofl/build`,
    { manifest, compose },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}

const validateRofl = async (
  { compose }: { compose: string },
  token: string,
): Promise<RoflValidateResponse> => {
  const response = await axios.post<RoflValidateResponse>(
    `${BACKEND_URL}/rofl/validate`,
    { compose },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}

const fetchRoflBuildResults = async (taskId: string, token: string): Promise<RoflBuildResultsResponse> => {
  const response = await axios.get<RoflBuildResultsResponse>(`${BACKEND_URL}/rofl/build/${taskId}/results`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  let enclaves = null
  if (response.data.manifest) {
    const enclaveIds: { id: string }[] = yaml.parse(atob(response.data.manifest)).deployments.default.policy
      .enclaves
    enclaves = enclaveIds.map(e => ({
      // split https://github.com/oasisprotocol/oasis-core/blob/113878af787d6c6f8da22d6b8a33f6a249180c8b/go/common/sgx/common.go#L209-L221
      mr_enclave: oasis.misc.fromBase64(e.id).slice(0, 32),
      mr_signer: oasis.misc.fromBase64(e.id).slice(32),
    }))
  }
  return { ...response.data, enclaves }
}

const uploadArtifact = async ({ id, file }: ArtifactUploadRequest, token: string): Promise<void> => {
  await axios.put(`${BACKEND_URL}/artifacts/${id}`, file, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    transformRequest: [data => data],
  })
}

export const downloadArtifact = async (id: ArtifactId, token: string): Promise<ArtifactDownloadResponse> => {
  const response = await axios.get(`${BACKEND_URL}/artifacts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'text',
  })
  return response.data
}

export function useGetNonce(address: string | undefined) {
  return useQuery<string, AxiosError<unknown>>({
    queryKey: ['nonce', address],
    queryFn: () => fetchNonce(address!),
    enabled: !!address,
    staleTime: 0,
    throwOnError: false,
  })
}

export function useLogin() {
  return useMutation<string, AxiosError<unknown>, LoginRequest>({
    mutationFn: login,
    throwOnError: false,
  })
}

export function useGetMe(token: string | null) {
  return useQuery<MeResponse, AxiosError<unknown>>({
    queryKey: ['me', token],
    queryFn: () => fetchMe(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 3, // 3 minutes
    throwOnError: false,
  })
}

export function useUploadArtifact(token: string | null) {
  return useMutation<void, AxiosError<unknown>, ArtifactUploadRequest>({
    mutationFn: data => uploadArtifact(data, token!),
    throwOnError: false,
    onError: error => {
      console.error('Error uploading artifact:', error)
    },
  })
}

export function useDownloadArtifact(id: ArtifactId | null, token: string | null, enabled: boolean = true) {
  return useQuery<ArtifactDownloadResponse, AxiosError<unknown>>({
    queryKey: ['artifact-download', id, token],
    queryFn: () => downloadArtifact(id!, token!),
    enabled: !!id && !!token && enabled,
    staleTime: 0,
    throwOnError: false,
  })
}

export function useValidateRofl(token: string | null) {
  return useMutation<RoflValidateResponse, AxiosError<unknown>, { compose: string }>({
    mutationFn: data => validateRofl(data, token!),
    throwOnError: false,
    onError: error => {
      console.error('Error validating ROFL:', error)
    },
  })
}

async function waitForAppId(creationTxHash: string, network: 'mainnet' | 'testnet', timeout = 60_000) {
  const interval = 1000
  const maxTries = timeout / interval
  // TODO: could use waitForTransactionReceipt + visiting events in a block to get the app id
  for (let i = 0; i < maxTries; i++) {
    // https://testnet.nexus.oasis.io/v1/sapphire/events?tx_hash=d54ca9ec38c42eeffdf14c4f2717041c72cbe5ce90d67f1d6f179372669fc451&limit=10&offset=0&type=rofl.app_created
    const response = await GetRuntimeEvents(network, 'sapphire', {
      tx_hash: creationTxHash.replace('0x', ''),
      type: 'rofl.app_created',
    })
    const appId = response.data.events?.[0]?.body?.id
    if (appId) return appId as `rofl1${string}`
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('waitForAppId timed out')
}

async function waitForMachineId(creationTxHash: string, network: 'mainnet' | 'testnet', timeout = 60_000) {
  const interval = 1000
  const maxTries = timeout / interval
  // TODO: could use waitForTransactionReceipt + visiting events in a block to get the machine id
  for (let i = 0; i < maxTries; i++) {
    // https://testnet.nexus.oasis.io/v1/sapphire/events?tx_hash=a3491aa5e8e38a756f6b8e1db09cc6288005967c1eea183aa3ca7bdb97cb8cf4&limit=10&offset=0&type=roflmarket.instance_created
    const response = await GetRuntimeEvents(network, 'sapphire', {
      tx_hash: creationTxHash.replace('0x', ''),
      type: 'roflmarket.instance_created',
    })
    const machineId = response.data.events?.[0]?.body?.id
    if (machineId) {
      await new Promise(r => setTimeout(r, 3000)) // Delay for Nexus to index machine
      return oasis.misc.toHex(new Uint8Array(response.data.events?.[0]?.body?.id as Array<number>))
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('waitForMachineId timed out')
}

async function waitForBuildResults(taskId: string, token: string, timeout = 600_000) {
  const interval = 3000
  const maxTries = timeout / interval
  for (let i = 0; i < maxTries; i++) {
    const results = await fetchRoflBuildResults(taskId, token)
    if (results.err) throw new Error('Build failed ' + results.err)
    if ('oci_reference' in results && results.enclaves) return results
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('waitForBuildResults timed out')
}

async function waitForAppScheduler(
  appId: `rofl1${string}`,
  network: 'mainnet' | 'testnet',
  createdAfter = new Date().getTime() - 5 * 60 * 1000,
  timeout = 600_000,
) {
  const interval = 1000
  const maxTries = timeout / interval
  for (let i = 0; i < maxTries; i++) {
    // https://testnet.nexus.oasis.io/v1/sapphire/roflmarket_instances?deployed_app_id=rofl1qrauzv0rnmedtxdjhdp4zjfhk6uzxefpaq5yqz0v
    const { data } = await GetRuntimeRoflmarketInstances(network, 'sapphire', { deployed_app_id: appId })

    // instances[0] should be latest machine, but Nexus might be delayed and missing
    // new ones. Wait for a latest machine that is not older than 5 minutes.
    if (data.instances?.[0] && new Date(data.instances[0]?.created_at).getTime() > createdAfter) {
      const node_id = data.instances[0].node_id
      const scheduler = data.instances[0].metadata?.['net.oasis.scheduler.rak']
      if (node_id && scheduler) return scheduler
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('waitForAppScheduler timed out')
}

const trackBootstrapStepEvent = (stepNumber: number, step: string, templateId?: string) => {
  trackEvent(
    `Create app flow${stepNumber ? `/${stepNumber}` : ''}/bootstrap/${step}${templateId ? `/${templateId}` : ''}`,
  )
}

export function useCreateAndDeployApp() {
  const { blockNavigatingAway, allowNavigatingAway } = useBlockNavigatingAway()
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()
  const steps = ['creating' as const, 'building' as const, 'updating' as const, 'deploying' as const]
  const [currentStep, setCurrentStep] = useState<(typeof steps)[number]>('creating')
  const stepEstimatedDurations: { [step in (typeof steps)[number]]?: number } = {
    creating: 40_000,
    building: 80_000,
    deploying: 80_000,
  }
  const stepLabels = {
    creating: 'Creating app',
    building: 'Building app',
    updating: 'Updating app secrets',
    deploying: 'Deploying app to machine',
  } satisfies { [step in (typeof steps)[number]]: string }

  const mutation = useMutation<
    string,
    AxiosError<unknown>,
    {
      token: string
      template: Template
      appData: AppData
      network: 'mainnet' | 'testnet'
      address: `0x${string}`
    }
  >({
    onSettled() {
      allowNavigatingAway()
    },
    mutationFn: async ({ token, template, appData, network, address }) => {
      blockNavigatingAway()
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const nic = new oasis.client.NodeInternal(
        network === 'mainnet' ? 'https://grpc.oasis.io' : 'https://testnet.grpc.oasis.io',
      )

      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)
      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId)

      const build = appData.build!
      const duration = convertToDurationTerms({
        duration: build.duration,
        number: build.number,
      })

      let hash
      toast('Create app id?')
      setCurrentStep('creating')

      trackBootstrapStepEvent(5, 'create_app_start', appData.templateId)

      hash = await sendTransactionAsync(
        rofl
          .callCreate()
          .setBody({
            scheme: oasisRT.types.IdentifierScheme.CreatorRoundIndex,
            policy: {
              quotes: {
                pcs: {
                  tcb_validity_period: 30,
                  min_tcb_evaluation_data_number: 18,
                  tdx: {},
                },
              },
              enclaves: [],
              endorsements: [
                {
                  provider_instance_admin: getOasisAddressBytesFromEvm(address),
                },
              ],
              fees: oasisRT.types.FeePolicy.EndorsingNodePays,
              max_expiration: 3,
            },
            metadata: {
              'net.oasis.rofl.name': `Draft of ${appData.metadata?.name || ''}`,
              'net.oasis.rofl.author': appData.metadata?.author || '',
              'net.oasis.rofl.description': appData.metadata?.description || '',
              'net.oasis.rofl.version': appData.metadata?.version || '',
              'net.oasis.rofl.homepage': appData.metadata?.homepage || '',
              'net.oasis.roflapp.template': appData.templateId || '',
              'net.oasis.roflapp.created_using_commit': BUILD_COMMIT,
            },
          })
          .toSubcall(),
      )
      console.log('create app: tx hash', hash)
      const appId = await waitForAppId(hash, network)
      console.log('appId', appId)
      toast('Got app id ' + appId)

      trackBootstrapStepEvent(6, 'create_app_completed', appData.templateId)

      const roflTemplateYaml = template.yaml.rofl
      // TODO: wait + handle error?
      uploadArtifact(
        { id: `${appId}-rofl-template-yaml`, file: new Blob([yaml.stringify(roflTemplateYaml)]) },
        token,
      )
      uploadArtifact(
        { id: `${appId}-readme-md`, file: new Blob([getReadmeByTemplateId(appData.templateId!)]) },
        token,
      )

      const app = await rofl
        .queryApp()
        .setArgs({ id: oasisRT.rofl.fromBech32(appId) })
        .query(nic)
      console.log('App', app)

      const manifest = yaml.stringify(
        fillTemplate(roflTemplateYaml, appData.metadata!, build, network, appId, address),
      )
      const compose = template.yaml.compose
      console.log('Build?')
      setCurrentStep('building')

      trackBootstrapStepEvent(7, 'building_start', appData.templateId)

      // TODO: wait + handle error?
      uploadArtifact({ id: `${appId}-rofl-yaml`, file: new Blob([manifest]) }, token)
      uploadArtifact({ id: `${appId}-compose-yaml`, file: new Blob([compose]) }, token)
      const { task_id } = await buildRofl({ manifest, compose }, token)
      const buildResults = await waitForBuildResults(task_id, token)
      console.log('Build results:', buildResults)

      trackBootstrapStepEvent(8, 'building_completed', appData.templateId)

      toast('Save build results and secrets into app config?')
      setCurrentStep('updating')

      trackBootstrapStepEvent(9, 'updating_start', appData.templateId)

      const secrets = appData.inputs?.secrets
      hash = await sendTransactionAsync(
        rofl
          .callUpdate()
          .setBody({
            id: app.id,
            admin: app.admin,
            metadata: {
              ...app.metadata,
              'net.oasis.rofl.name': appData.metadata?.name || '',
            },
            policy: {
              ...app.policy,
              enclaves: [...app.policy.enclaves, ...buildResults.enclaves!],
            },
            secrets: Object.fromEntries(
              Object.entries(secrets ?? {}).map(([key, value]) => {
                return [
                  key,
                  oasis.misc.fromBase64(
                    oasisRT.rofl.encryptSecret(key, oasis.misc.fromString(String(value)), app.sek),
                  ),
                ]
              }),
            ),
          })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })
      toast('App config updated')

      trackBootstrapStepEvent(10, 'updating_completed', appData.templateId)

      toast('Queue app deploy?')
      setCurrentStep('deploying')

      trackBootstrapStepEvent(11, 'deploying_start', appData.templateId)

      hash = await sendTransactionAsync(
        roflmarket
          .callInstanceCreate()
          .setBody({
            provider: oasis.staking.addressFromBech32(build.provider!),
            offer: oasis.misc.fromHex(build.offerId!),
            deployment: {
              app_id: app.id,
              manifest_hash: oasis.misc.fromHex(buildResults.manifest_hash),
              metadata: {
                'net.oasis.deployment.orc.ref': buildResults.oci_reference,
              },
            },
            term: duration.term,
            term_count: duration.term_count,
          })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })
      toast('Deploy queued')

      await waitForAppScheduler(appId, network)

      toastWithDuration('App is starting (~5min)', 5 * 60 * 1000)

      trackBootstrapStepEvent(12, 'deploying_completed', appData.templateId)

      return appId
    },
  })

  return {
    ...mutation,
    progress: { steps, currentStep, stepLabels, stepEstimatedDurations },
  }
}

/** Based on {@link useCreateAndDeployApp} */
export function useDeployAppToNewMachine() {
  const { blockNavigatingAway, allowNavigatingAway } = useBlockNavigatingAway()
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()
  const steps = ['building' as const, 'updating' as const, 'deploying' as const]
  const [currentStep, setCurrentStep] = useState<(typeof steps)[number]>('building')
  const stepEstimatedDurations: { [step in (typeof steps)[number]]?: number } = {
    building: 80_000,
    deploying: 80_000,
  }
  const stepLabels = {
    // @ts-expect-error Extra field is needed for type to be compatible with HeaderSteps
    creating: 'skipped',
    building: 'Building app',
    updating: 'Updating app secrets',
    deploying: 'Deploying app to machine',
  } satisfies { [step in (typeof steps)[number]]: string }

  const mutation = useMutation<
    string,
    AxiosError<unknown>,
    {
      token: string
      appId: `rofl1${string}`
      build: BuildFormData
      network: 'mainnet' | 'testnet'
      address: `0x${string}`
    }
  >({
    onSettled() {
      allowNavigatingAway()
    },
    mutationFn: async ({ token, appId, build, network, address }) => {
      blockNavigatingAway()
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const nic = new oasis.client.NodeInternal(
        network === 'mainnet' ? 'https://grpc.oasis.io' : 'https://testnet.grpc.oasis.io',
      )

      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)
      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId)

      const duration = convertToDurationTerms({
        duration: build.duration,
        number: build.number,
      })

      const app = await rofl
        .queryApp()
        .setArgs({ id: oasisRT.rofl.fromBech32(appId) })
        .query(nic)
      console.log('App', app)

      const roflTemplateYaml = yaml.parse(await downloadArtifact(`${appId}-rofl-template-yaml`, token))
      const compose = await downloadArtifact(`${appId}-compose-yaml`, token)
      const manifest = yaml.stringify(
        fillTemplate(
          roflTemplateYaml,
          {
            name: app.metadata?.['net.oasis.rofl.name'],
            description: app.metadata?.['net.oasis.rofl.description'],
            author: app.metadata?.['net.oasis.rofl.author'],
            version: app.metadata?.['net.oasis.rofl.version'],
            homepage: app.metadata?.['net.oasis.rofl.homepage'],
          },
          build,
          network,
          appId,
          address,
        ),
      )
      console.log('Build?')
      // TODO: upload new variant of `${appId}-rofl-yaml` and `${appId}-compose-yaml`?
      const { task_id } = await buildRofl({ manifest, compose }, token)
      const buildResults = await waitForBuildResults(task_id, token)
      console.log('Build results:', buildResults)

      toast('Save build results into app config?')
      setCurrentStep('updating')
      let hash
      hash = await sendTransactionAsync(
        rofl
          .callUpdate()
          .setBody({
            id: app.id,
            admin: app.admin,
            metadata: app.metadata,
            policy: {
              ...app.policy,
              enclaves: [...app.policy.enclaves, ...buildResults.enclaves!],
            },
            secrets: app.secrets,
          })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })
      toast('App config updated')

      toast('Queue app deploy?')
      setCurrentStep('deploying')
      hash = await sendTransactionAsync(
        roflmarket
          .callInstanceCreate()
          .setBody({
            provider: oasis.staking.addressFromBech32(build.provider!),
            offer: oasis.misc.fromHex(build.offerId!),
            deployment: {
              app_id: app.id,
              manifest_hash: oasis.misc.fromHex(buildResults.manifest_hash),
              metadata: {
                'net.oasis.deployment.orc.ref': buildResults.oci_reference,
              },
            },
            term: duration.term,
            term_count: duration.term_count,
          })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })
      toast('Deploy queued')

      await waitForAppScheduler(appId, network)

      toastWithDuration('App is starting (~5min)', 5 * 60 * 1000)
      return appId
    },
  })

  return {
    ...mutation,
    progress: { steps, currentStep, stepLabels, stepEstimatedDurations },
  }
}

export function useUpdateApp() {
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()
  const { mutateAsync: restartMachine } = useMachineExecuteRestartCmd()

  return useMutation<
    string,
    AxiosError<unknown>,
    {
      appId: `rofl1${string}`
      metadataViewState: ViewMetadataState
      secretsViewState: ViewSecretsState
      network: 'mainnet' | 'testnet'
    }
  >({
    mutationFn: async ({ appId, metadataViewState, secretsViewState, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const nic = new oasis.client.NodeInternal(
        network === 'mainnet' ? 'https://grpc.oasis.io' : 'https://testnet.grpc.oasis.io',
      )

      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId)

      const app = await rofl
        .queryApp()
        .setArgs({ id: oasisRT.rofl.fromBech32(appId) })
        .query(nic)

      console.log('update metadata/secrets?')
      const hash = await sendTransactionAsync(
        rofl
          .callUpdate()
          .setBody({
            id: app.id,
            admin: app.admin,
            policy: app.policy,
            metadata: {
              ...metadataViewState.metadata,
              'net.oasis.rofl.name': metadataViewState.metadata?.name || '',
              'net.oasis.rofl.author': metadataViewState.metadata?.author || '',
              'net.oasis.rofl.description': metadataViewState.metadata?.description || '',
              'net.oasis.rofl.version': metadataViewState.metadata?.version || '',
              'net.oasis.rofl.homepage': metadataViewState.metadata?.homepage || '',
            },
            secrets: secretsViewState.isDirty
              ? Object.fromEntries(
                  Object.entries(secretsViewState.secrets ?? {}).map(([key, value]) => {
                    return [key, oasis.misc.fromBase64(value)]
                  }),
                )
              : app.secrets,
          })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })
      toast('App updated')

      if (secretsViewState.isDirty) {
        const machinesResponse = await GetRuntimeRoflmarketInstances(network, 'sapphire', {
          deployed_app_id: appId,
        })
        const activeMachines = machinesResponse.data.instances.filter(m => !isMachineRemoved(m))
        console.log('restart machines?', activeMachines)
        for (const machine of activeMachines) {
          const hash = await restartMachine({ machineId: machine.id, provider: machine.provider, network })
          await waitForTransactionReceipt(wagmiConfig, { hash })
          toastWithDuration('Machine is restarting (~1min)', 1 * 60 * 1000)
        }
      }
      return appId
    },
  })
}

export function useRemoveApp() {
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()
  const { mutateAsync: stopMachine } = useMachineExecuteStopCmd()
  return useMutation<void, AxiosError<unknown>, { appId: `rofl1${string}`; network: 'mainnet' | 'testnet' }>({
    mutationFn: async ({ appId, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId)
      const hash = await sendTransactionAsync(
        rofl
          .callRemove()
          .setBody({ id: oasisRT.rofl.fromBech32(appId) })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })

      const machinesResponse = await GetRuntimeRoflmarketInstances(network, 'sapphire', {
        deployed_app_id: appId,
      })
      const activeMachines = machinesResponse.data.instances.filter(m => !isMachineRemoved(m))
      console.log('stop machines?', activeMachines)
      for (const machine of activeMachines) {
        const hash = await stopMachine({ machineId: machine.id, provider: machine.provider, network })
        await waitForTransactionReceipt(wagmiConfig, { hash })
      }
    },
  })
}

export function useMachineExecuteRestartCmd() {
  const { sendTransactionAsync } = useSendTransaction()
  return useMutation<
    `0x${string}`,
    AxiosError<unknown>,
    { machineId: string; provider: string; network: 'mainnet' | 'testnet' }
  >({
    mutationFn: async ({ machineId, provider, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)

      const encodedCommand = oasis.misc.toCBOR({
        // https://github.com/oasisprotocol/cli/blob/b6894a1bb6ea7918a9b2ba3efe30b1911388e2f6/build/rofl/scheduler/commands.go#L9-L42
        method: 'Restart',
        args: {
          wipe_storage: false,
        },
      })

      return await sendTransactionAsync(
        roflmarket
          .callInstanceExecuteCmds()
          .setBody({
            provider: oasis.staking.addressFromBech32(provider),
            id: oasis.misc.fromHex(machineId) as oasisRT.types.MachineID,
            cmds: [encodedCommand],
          })
          .toSubcall(),
      )
      // Doesn't wait for transaction receipt
      // Takes about 1 minute to complete after transaction receipt.
    },
  })
}

export function useMachineExecuteStopCmd() {
  const { sendTransactionAsync } = useSendTransaction()
  return useMutation<
    `0x${string}`,
    AxiosError<unknown>,
    { machineId: string; provider: string; network: 'mainnet' | 'testnet' }
  >({
    mutationFn: async ({ machineId, provider, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)

      const encodedCommand = oasis.misc.toCBOR({
        // https://github.com/oasisprotocol/cli/blob/b6894a1bb6ea7918a9b2ba3efe30b1911388e2f6/build/rofl/scheduler/commands.go#L9-L42
        method: 'Terminate',
        args: {
          wipe_storage: false,
        },
      })

      return await sendTransactionAsync(
        roflmarket
          .callInstanceExecuteCmds()
          .setBody({
            provider: oasis.staking.addressFromBech32(provider),
            id: oasis.misc.fromHex(machineId) as oasisRT.types.MachineID,
            cmds: [encodedCommand],
          })
          .toSubcall(),
      )
      // Doesn't wait for transaction receipt
      // Takes about 1 minute to complete after transaction receipt
    },
  })
}

export function useMachineTopUp() {
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()
  return useMutation<
    string,
    AxiosError<unknown>,
    { machine: RoflMarketInstance; provider: string; network: 'mainnet' | 'testnet'; build: BuildFormData }
  >({
    mutationFn: async ({ machine, provider, network, build }) => {
      const duration = convertToDurationTerms({
        duration: build.duration,
        number: build.number,
      })

      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)

      const { term, term_count } = duration

      if (!isMachineRemoved(machine)) {
        const hash = await sendTransactionAsync(
          roflmarket
            .callInstanceTopUp()
            .setBody({
              provider: oasis.staking.addressFromBech32(provider),
              id: oasis.misc.fromHex(machine.id) as oasisRT.types.MachineID,
              term,
              term_count,
            })
            .toSubcall(),
        )
        await waitForTransactionReceipt(wagmiConfig, { hash })
        return machine.id
      } else {
        toast('Previous machine was removed. Queue new machine?')
        const hash = await sendTransactionAsync(
          roflmarket
            .callInstanceCreate()
            .setBody({
              provider: oasis.staking.addressFromBech32(provider),
              offer: oasis.misc.fromHex(machine.offer_id),
              deployment: {
                app_id: oasisRT.rofl.fromBech32(machine.deployment.app_id as string),
                manifest_hash: oasis.misc.fromHex(machine.deployment.manifest_hash as string),
                metadata: {
                  // TODO: Security: trusts Nexus about old oci_reference. But if Nexus
                  // tampers with it, will it fail app.policy.enclaves?
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  'net.oasis.deployment.orc.ref': (machine.deployment.metadata as any)[
                    'net.oasis.deployment.orc.ref'
                  ],
                  // Copy permissions like log.view
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...((machine.deployment.metadata as any)['net.oasis.scheduler.permissions'] && {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    'net.oasis.scheduler.permissions': (machine.deployment.metadata as any)[
                      'net.oasis.scheduler.permissions'
                    ],
                  }),
                },
              },
              term: duration.term,
              term_count: duration.term_count,
            })
            .toSubcall(),
        )
        await waitForTransactionReceipt(wagmiConfig, { hash })
        toast('New machine queued')
        const newMachineId = await waitForMachineId(hash, network)
        return newMachineId
      }
    },
  })
}
