import axios from 'axios';
import type { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Template } from '../pages/CreateApp/BootstrapStep';
import type { AppData } from '../pages/CreateApp/types';
import * as yaml from 'yaml';
import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';
import { GetRuntimeEvents } from '../nexus/api';
import { useConfig, useSendTransaction } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';

const BACKEND_URL = import.meta.env.VITE_ROFL_APP_BACKEND;

type NonceResponse = {
  nonce: string;
};

type LoginResponse = {
  token: string;
};

type LoginRequest = {
  message: string;
  signature: string;
};

type MeResponse = {
  address: string;
  [key: string]: unknown;
};

type RoflBuildRequest = {
  manifest: string;
  compose: string;
};

type RoflBuildResponse = {
  task_id: string;
};

type RoflBuildResultsResponse = {
  manifest: string | null;
  oci_reference: string;
  manifest_hash: string;
  logs: string;
  err: string;
};

type ArtifactUploadRequest = {
  id: string;
  file: File | Blob;
};

type ArtifactDownloadResponse = Blob;

const fetchNonce = async (address: string): Promise<string> => {
  const response = await axios.get<NonceResponse>(`${BACKEND_URL}/auth/nonce`, {
    params: { address },
  });
  return response.data.nonce;
};

const login = async ({ message, signature }: LoginRequest): Promise<string> => {
  const response = await axios.post<LoginResponse>(
    `${BACKEND_URL}/auth/login`,
    { message },
    {
      params: { sig: signature },
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data.token;
};

const fetchMe = async (token: string): Promise<MeResponse> => {
  const response = await axios.get<MeResponse>(`${BACKEND_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const buildRofl = async (
  { manifest, compose }: RoflBuildRequest,
  token: string
): Promise<RoflBuildResponse> => {
  const response = await axios.post<RoflBuildResponse>(
    `${BACKEND_URL}/rofl/build`,
    { manifest, compose },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

const fetchRoflBuildResults = async (
  taskId: string,
  token: string
): Promise<RoflBuildResultsResponse> => {
  const response = await axios.get<RoflBuildResultsResponse>(
    `${BACKEND_URL}/rofl/build/${taskId}/results`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const uploadArtifact = async (
  { id, file }: ArtifactUploadRequest,
  token: string
): Promise<void> => {
  await axios.put(`${BACKEND_URL}/artifacts/${id}`, file, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    transformRequest: [(data) => data],
  });
};

const downloadArtifact = async (
  id: string,
  token: string
): Promise<ArtifactDownloadResponse> => {
  const response = await axios.get(`${BACKEND_URL}/artifacts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  });
  return response.data;
};

export function useGetNonce(address: string | undefined) {
  return useQuery<string, AxiosError<unknown>>({
    queryKey: ['nonce', address],
    queryFn: () => fetchNonce(address!),
    enabled: !!address,
    staleTime: 0,
    throwOnError: false,
  });
}

export function useLogin() {
  return useMutation<string, AxiosError<unknown>, LoginRequest>({
    mutationFn: login,
    throwOnError: false,
  });
}

export function useGetMe(token: string | null) {
  return useQuery<MeResponse, AxiosError<unknown>>({
    queryKey: ['me', token],
    queryFn: () => fetchMe(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 3, // 3 minutes
    throwOnError: false,
  });
}

export function useBuildRofl(
  token: string | null,
  onSuccess: (data: RoflBuildResponse) => void
) {
  return useMutation<RoflBuildResponse, AxiosError<unknown>, RoflBuildRequest>({
    mutationFn: (data) => buildRofl(data, token!),
    throwOnError: false,
    onSuccess: onSuccess,
    onError: (error) => {
      console.error('Error starting build:', error);
    },
  });
}

export function useGetRoflBuildResults(
  taskId: string | null,
  token: string | null
) {
  return useQuery<RoflBuildResultsResponse, AxiosError<unknown>>({
    queryKey: ['rofl-build-results', taskId, token],
    queryFn: () => {
      return fetchRoflBuildResults(taskId!, token!);
    },
    enabled: !!taskId && !!token,
    refetchInterval: (data) => {
      if (data.state.data?.err) {
        return false;
      }
      return 3000;
    },
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false,
  });
}

export function useUploadArtifact(token: string | null) {
  return useMutation<void, AxiosError<unknown>, ArtifactUploadRequest>({
    mutationFn: (data) => uploadArtifact(data, token!),
    throwOnError: false,
    onError: (error) => {
      console.error('Error uploading artifact:', error);
    },
  });
}

export function useDownloadArtifact(
  id: string | null,
  token: string | null,
  enabled: boolean = true
) {
  return useQuery<ArtifactDownloadResponse, AxiosError<unknown>>({
    queryKey: ['artifact-download', id, token],
    queryFn: () => downloadArtifact(id!, token!),
    enabled: !!id && !!token && enabled,
    staleTime: 0,
    throwOnError: false,
  });
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
    const appId = response.data.events?.[0]?.body?.id;
    if (appId) return appId as `rofl1${string}`;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('waitForAppId timed out');
}

async function waitForBuildResults(taskId: string, token: string, timeout = 300_000) {
  const interval = 3000
  const maxTries = timeout / interval
  for (let i = 0; i < maxTries; i++) {
    const results = await fetchRoflBuildResults(taskId, token)
    if (results.err) throw new Error('Build failed ' + results.err)
    if ('oci_reference' in results) return results;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('waitForBuildResults timed out');
}

export function useCreateAndDeployApp() {
  const wagmiConfig = useConfig()
  const { sendTransactionAsync } = useSendTransaction()

  return useMutation<string, AxiosError<unknown>, { token: string, template: Template, appData: AppData, network: 'mainnet' | 'testnet' }>({
    mutationFn: async ({ token, appData, network }) => {
      const sapphireRuntimeId = network === 'mainnet' ? oasis.misc.fromHex('000000000000000000000000000000000000000000000000f80306c9858e7279') : oasis.misc.fromHex('000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c')
      const nic = new oasis.client.NodeInternal(network === 'mainnet' ? 'https://grpc.oasis.io' : 'https://testnet.grpc.oasis.io');

      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId);
      const rofl = new oasisRT.rofl.Wrapper(sapphireRuntimeId);

      let hash
      console.log('create app?');
      hash = await sendTransactionAsync(rofl
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
            'net.oasis.rofl.license': 'Apache-2.0',
            'net.oasis.rofl.name': 'create through subcall',
            'net.oasis.rofl.repository':
              'https://github.com/oasisprotocol/oasis-sdk/tree/main/client-sdk/ts-web',
            'net.oasis.rofl.version': '0.1.0',
          },
        })
        .toSubcall());
      console.log('create app: tx hash', hash);
      const appId = await waitForAppId(hash, network);
      console.log('appId', appId);

      const app = await rofl.queryApp().setArgs({ id: oasisRT.rofl.fromBech32(appId) }).query(nic);
      console.log('App', app);

      const manifest = `
        name: simpler-demo-rofl
        version: 0.1.1
        repository: https://github.com/lukaw3d/simpler-demo-rofl
        license: Apache-2.0
        tee: tdx
        kind: container
        resources:
          memory: 512
          cpus: 1
          storage:
            kind: disk-persistent
            size: 512
        artifacts:
          firmware: https://github.com/oasisprotocol/oasis-boot/releases/download/v0.5.0/ovmf.tdx.fd#db47100a7d6a0c1f6983be224137c3f8d7cb09b63bb1c7a5ee7829d8e994a42f
          kernel: https://github.com/oasisprotocol/oasis-boot/releases/download/v0.5.0/stage1.bin#23877530413a661e9187aad2eccfc9660fc4f1a864a1fbad2f6c7d43512071ca
          stage2: https://github.com/oasisprotocol/oasis-boot/releases/download/v0.5.0/stage2-podman.tar.bz2#631349bef06990dd6ae882812a0420f4b35f87f9fe945b274bcfb10fc08c4ea3
          container:
            runtime: https://github.com/oasisprotocol/oasis-sdk/releases/download/rofl-containers%2Fv0.5.1/rofl-containers#9afa712b939528d758294bf49181466fc2066bbe507f92777ddc3bce8af6ee37
            compose: compose.yaml
        deployments:
          default:
            app_id: ${appId}
            network: ${network}
            paratime: sapphire
            policy:
              enclaves:
              endorsements:
                - any: {}
              fees: endorsing_node
              max_expiration: 3
      `;
      const compose = `
        services:
          echo:
            image: docker.io/denoland/deno:alpine
            command: |
              sh -c "deno run --allow-all - <<'EOF'

              import { encodeFunctionData, parseAbi } from 'npm:viem'

              // MESSAGE comes from: rofl.yaml secrets -> compose.yaml environment -> podman/docker
              const MESSAGE = Deno.env.get('MESSAGE') ?? 'No message found'
              const CONTRACT_ADDRESS = Deno.env.get('CONTRACT_ADDRESS')

              const calldata = encodeFunctionData({
                abi: parseAbi(['function emitMessage(string memory message) public']),
                functionName: 'emitMessage',
                args: [MESSAGE]
              })

              console.log({calldata})

              // Submit it to the Sapphire contract Echo.sol on testnet
              await fetch('http://localhost/rofl/v1/tx/sign-submit', {
                method: 'POST',
                body: JSON.stringify({
                  'encrypt': true,
                  'tx': {
                    'kind': 'eth',
                    'data': {
                      'gas_limit': 200000,
                      'to': CONTRACT_ADDRESS.replace('0x', ''),
                      'value': 0,
                      'data': calldata.replace('0x', '')
                    }
                  }
                }),
                client: Deno.createHttpClient({ proxy: { transport: 'unix', path: '/run/rofl-appd.sock' } }),
              });

              EOF
              "
            platform: linux/amd64
            environment:
              # Address of the Echo contract deployed on Sapphire.
              # https://explorer.oasis.io/testnet/sapphire/address/0x5d683b980615A7A60B3cFf3DFC338A9985278fF3
              - CONTRACT_ADDRESS=0x5d683b980615A7A60B3cFf3DFC338A9985278fF3
              - MESSAGE=\${MESSAGE}
            volumes:
              - /run/rofl-appd.sock:/run/rofl-appd.sock
      `
      console.log('Build?');
      const { task_id } = await buildRofl({ manifest, compose }, token)
      const buildResults = await waitForBuildResults(task_id, token)
      console.log('Build results:', buildResults);

      const enclaves = yaml.parse(atob(buildResults.manifest!)).deployments.default.policy.enclaves.map((e: { id: string }) => ({
        // split https://github.com/oasisprotocol/oasis-core/blob/113878af787d6c6f8da22d6b8a33f6a249180c8b/go/common/sgx/common.go#L209-L221
        mr_enclave: oasis.misc.fromBase64(e.id).slice(0, 32),
        mr_signer: oasis.misc.fromBase64(e.id).slice(32),
      }))

      console.log('update app with enclaves and secrets?');
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
            secrets: {
              ...app.secrets,
              MESSAGE: oasis.misc.fromBase64( // TODO: secrets
                oasisRT.rofl.encryptSecret('MESSAGE', oasis.misc.fromString('secret'), app.sek),
              ),
            },
          })
          .toSubcall(),
      );
      await waitForTransactionReceipt(wagmiConfig, { hash })

      console.log('deploy app?');
      hash = await sendTransactionAsync(
        roflmarket
          .callInstanceCreate()
          .setBody({
            "provider": oasis.staking.addressFromBech32(appData.build!.provider!),
            "offer": oasis.misc.fromHex("0000000000000003"), // TODO: appData.build.resources
            "deployment": {
              "app_id": app.id,
              "manifest_hash": oasis.misc.fromHex(buildResults.manifest_hash),
              "metadata": {
                "net.oasis.deployment.orc.ref": buildResults.oci_reference,
              }
            },
            "term": oasisRT.types.RoflmarketTerm.HOUR,
            "term_count": 1, // TODO: how long to rent?
          })
          .toSubcall(),
      );
      await waitForTransactionReceipt(wagmiConfig, { hash })
      console.log('deployed', appId);

      return appId
    },
  });
}
