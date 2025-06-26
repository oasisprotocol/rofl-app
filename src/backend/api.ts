import axios from 'axios'
import type { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Template } from '../pages/CreateApp/BootstrapStep'
import type { AppData } from '../pages/CreateApp/types'
import * as yaml from 'yaml'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'
import { GetRuntimeEvents } from '../nexus/api'
import { useConfig, useSendTransaction } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'

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
}

type ArtifactUploadRequest = {
  id: string
  file: File | Blob
}

type ArtifactDownloadResponse = Blob

const fetchNonce = async (address: string): Promise<string> => {
  const response = await axios.get<NonceResponse>(`${BACKEND_URL}/auth/nonce`, {
    params: { address },
  })
  return response.data.nonce
}

const login = async ({ message, signature }: LoginRequest): Promise<string> => {
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

const fetchRoflBuildResults = async (taskId: string, token: string): Promise<RoflBuildResultsResponse> => {
  const response = await axios.get<RoflBuildResultsResponse>(`${BACKEND_URL}/rofl/build/${taskId}/results`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
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

const downloadArtifact = async (id: string, token: string): Promise<ArtifactDownloadResponse> => {
  const response = await axios.get(`${BACKEND_URL}/artifacts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
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

export function useDownloadArtifact(id: string | null, token: string | null, enabled: boolean = true) {
  return useQuery<ArtifactDownloadResponse, AxiosError<unknown>>({
    queryKey: ['artifact-download', id, token],
    queryFn: () => downloadArtifact(id!, token!),
    enabled: !!id && !!token && enabled,
    staleTime: 0,
    throwOnError: false,
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
      limit: 10,
      offset: 0,
    })
    const appId = response.data.events?.[0]?.body?.id
    if (appId) return appId as `rofl1${string}`
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('waitForAppId timed out')
}

async function waitForBuildResults(taskId: string, token: string, timeout = 300_000) {
  const interval = 3000
  const maxTries = timeout / interval
  for (let i = 0; i < maxTries; i++) {
    const results = await fetchRoflBuildResults(taskId, token)
    if (results.err) throw new Error('Build failed ' + results.err)
    if ('oci_reference' in results) return results
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('waitForBuildResults timed out')
}

export function useCreateAndDeployApp() {
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()

  return useMutation<
    string,
    AxiosError<unknown>,
    { token: string; template: Template; appData: AppData; network: 'mainnet' | 'testnet' }
  >({
    mutationFn: async ({ token, template, appData, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const nic = new oasis.client.NodeInternal(
        network === 'mainnet' ? 'https://grpc.oasis.io' : 'https://testnet.grpc.oasis.io',
      )

      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)
      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId)

      const duration =
        appData.build!.duration === 'months'
          ? {
              term: oasisRT.types.RoflmarketTerm.MONTH,
              term_count: appData.build!.number,
            }
          : appData.build!.duration === 'days'
            ? {
                term: oasisRT.types.RoflmarketTerm.HOUR,
                term_count: appData.build!.number * 24,
              }
            : appData.build!.duration === 'hours'
              ? {
                  term: oasisRT.types.RoflmarketTerm.HOUR,
                  term_count: appData.build!.number,
                }
              : undefined
      if (!duration) throw new Error('Invalid duration')

      let hash
      console.log('create app?')
      hash = await sendTransactionAsync(
        rofl
          .callCreate()
          .setBody({
            scheme: oasisRT.types.IdentifierScheme.CreatorNonce,
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
                  any: {},
                },
              ],
              fees: oasisRT.types.FeePolicy.EndorsingNodePays,
              max_expiration: 3,
            },
            metadata: {
              'net.oasis.rofl.name': appData.metadata?.name || '',
              'net.oasis.rofl.author': appData.metadata?.author || '',
              'net.oasis.rofl.description': appData.metadata?.description || '',
              'net.oasis.rofl.version': appData.metadata?.version || '',
              'net.oasis.rofl.homepage': appData.metadata?.homepage || '',
              'net.oasis.rofl.license': appData.metadata?.license || '',
            },
          })
          .toSubcall(),
      )
      console.log('create app: tx hash', hash)
      const appId = await waitForAppId(hash, network)
      console.log('appId', appId)

      const app = await rofl
        .queryApp()
        .setArgs({ id: oasisRT.rofl.fromBech32(appId) })
        .query(nic)
      console.log('App', app)

      const manifest = yaml.stringify(template.templateParser(appData.metadata!, network, appId))
      const compose = template.yaml.compose
      console.log('Build?')
      const { task_id } = await buildRofl({ manifest, compose }, token)
      const buildResults = await waitForBuildResults(task_id, token)
      console.log('Build results:', buildResults)

      const enclaves = yaml
        .parse(atob(buildResults.manifest!))
        .deployments.default.policy.enclaves.map((e: { id: string }) => ({
          // split https://github.com/oasisprotocol/oasis-core/blob/113878af787d6c6f8da22d6b8a33f6a249180c8b/go/common/sgx/common.go#L209-L221
          mr_enclave: oasis.misc.fromBase64(e.id).slice(0, 32),
          mr_signer: oasis.misc.fromBase64(e.id).slice(32),
        }))

      console.log('update app with enclaves and secrets?')
      hash = await sendTransactionAsync(
        rofl
          .callUpdate()
          .setBody({
            id: app.id,
            admin: app.admin,
            metadata: app.metadata,
            policy: {
              ...app.policy,
              enclaves: enclaves,
            },
            secrets: Object.fromEntries(
              Object.entries(appData.agent ?? {}).map(([key, value]) => {
                return [
                  key,
                  oasis.misc.fromBase64(
                    oasisRT.rofl.encryptSecret(key, oasis.misc.fromString(value), app.sek),
                  ),
                ]
              }),
            ),
          })
          .toSubcall(),
      )
      await waitForTransactionReceipt(wagmiConfig, { hash })

      console.log('deploy app?')
      hash = await sendTransactionAsync(
        roflmarket
          .callInstanceCreate()
          .setBody({
            provider: oasis.staking.addressFromBech32(appData.build!.provider!),
            offer: oasis.misc.fromHex(appData.build!.resources),
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
      console.log('deployed', appId)

      return appId
    },
  })
}

export function useRemoveApp() {
  const { sendTransactionAsync } = useSendTransaction()
  return useMutation<void, AxiosError<unknown>, { appId: `rofl1${string}`; network: 'mainnet' | 'testnet' }>({
    mutationFn: async ({ appId, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId)
      await sendTransactionAsync(
        rofl
          .callRemove()
          .setBody({ id: oasisRT.rofl.fromBech32(appId) })
          .toSubcall(),
      )
    },
  })
}

export function useMachineExecuteRestartCmd() {
  const { sendTransactionAsync } = useSendTransaction()
  return useMutation<
    void,
    AxiosError<unknown>,
    { machineId: string; provider: string; network: 'mainnet' | 'testnet' }
  >({
    mutationFn: async ({ machineId, provider, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)

      const restartRequest = {
        wipe_storage: false,
      }

      const command = {
        // https://github.com/oasisprotocol/cli/blob/b6894a1bb6ea7918a9b2ba3efe30b1911388e2f6/build/rofl/scheduler/commands.go#L9-L42
        method: 'Restart',
        args: oasis.misc.toCBOR(restartRequest),
      }

      const encodedCommand = oasis.misc.toCBOR(command)

      await sendTransactionAsync(
        roflmarket
          .callInstanceExecuteCmds()
          .setBody({
            provider: oasis.staking.addressFromBech32(provider),
            id: oasis.misc.fromHex(machineId) as oasisRT.types.MachineID,
            cmds: [encodedCommand],
          })
          .toSubcall(),
      )
    },
  })
}

export function useMachineExecuteStopCmd() {
  const { sendTransactionAsync } = useSendTransaction()
  return useMutation<
    void,
    AxiosError<unknown>,
    { machineId: string; provider: string; network: 'mainnet' | 'testnet' }
  >({
    mutationFn: async ({ machineId, provider, network }) => {
      const sapphireRuntimeId =
        network === 'mainnet'
          ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279')
          : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)

      const restartRequest = {
        wipe_storage: false,
      }

      const command = {
        // https://github.com/oasisprotocol/cli/blob/b6894a1bb6ea7918a9b2ba3efe30b1911388e2f6/build/rofl/scheduler/commands.go#L9-L42
        method: 'Terminate',
        args: oasis.misc.toCBOR(restartRequest),
      }

      const encodedCommand = oasis.misc.toCBOR(command)

      await sendTransactionAsync(
        roflmarket
          .callInstanceExecuteCmds()
          .setBody({
            provider: oasis.staking.addressFromBech32(provider),
            id: oasis.misc.fromHex(machineId) as oasisRT.types.MachineID,
            cmds: [encodedCommand],
          })
          .toSubcall(),
      )
    },
  })
}
