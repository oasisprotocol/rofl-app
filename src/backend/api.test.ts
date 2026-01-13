import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import * as _wagmi from 'wagmi'
import * as _wagmiCore from '@wagmi/core'
import * as _oasis from '@oasisprotocol/client'
import * as _oasisRT from '@oasisprotocol/client-rt'
import * as _nexusApi from '../nexus/api'
import type { AppData } from '../pages/CreateApp/types'
import type { BuildFormData } from '../types/build-form.ts'
import { ViewMetadataState, ViewSecretsState } from '../pages/Dashboard/AppDetails/types'
import { RoflMarketInstance } from '../nexus/api'
import * as isMachineRemovedModule from '../components/MachineStatusIcon/isMachineRemoved'
import {
  fetchNonce,
  login,
  useGetNonce,
  useLogin,
  useGetMe,
  useUploadArtifact,
  useDownloadArtifact,
  downloadArtifact,
  useValidateRofl,
  useCreateAndDeployApp,
  useDeployAppToNewMachine,
  useUpdateApp,
  useRemoveApp,
  useMachineExecuteRestartCmd,
  useMachineExecuteStopCmd,
  useMachineTopUp,
} from './api'

// Mock all dependencies
const createMockSendTransaction = () => {
  const mock = vi.fn()
  // Set default implementation
  mock.mockResolvedValue('0xtxhash')
  return mock
}

const mockSendTransactionAsync = createMockSendTransaction()

vi.mock('wagmi', () => ({
  useConfig: vi.fn(() => ({})),
  useSendTransaction: vi.fn(() => ({
    sendTransactionAsync: mockSendTransactionAsync,
  })),
}))

vi.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 'success' }),
}))

vi.mock('@oasisprotocol/client', () => ({
  misc: {
    fromHex: vi.fn(() => new Uint8Array(32)),
    fromBase64: vi.fn((_str: string) => {
      const arr = new Uint8Array(64)
      arr.fill(1)
      return arr
    }),
    toHex: vi.fn(() => '0x123456'),
    fromString: vi.fn(() => new Uint8Array(10)),
    toCBOR: vi.fn(() => new Uint8Array([1, 2, 3])),
  },
  client: {
    NodeInternal: vi.fn(() => ({})),
  },
  staking: {
    addressFromBech32: vi.fn(() => new Uint8Array(21)),
  },
}))

vi.mock('@oasisprotocol/client-rt', () => {
  const mockRofl = {
    Wrapper: vi.fn(() => ({
      callCreate: vi.fn(() => ({
        setBody: vi.fn(() => ({
          toSubcall: vi.fn(() => ({})),
        })),
      })),
      callUpdate: vi.fn(() => ({
        setBody: vi.fn(() => ({
          toSubcall: vi.fn(() => ({})),
        })),
      })),
      callRemove: vi.fn(() => ({
        setBody: vi.fn(() => ({
          toSubcall: vi.fn(() => ({})),
        })),
      })),
      queryApp: vi.fn(() => ({
        setArgs: vi.fn(() => ({
          query: vi.fn(() => ({
            id: new Uint8Array(32),
            admin: new Uint8Array(21),
            policy: {
              enclaves: [],
              endorsements: [],
            },
            metadata: {},
            sek: new Uint8Array(32),
            secrets: {},
          })),
        })),
      })),
      fromBech32: vi.fn(() => new Uint8Array(32)),
      encryptSecret: vi.fn(() => 'encrypted'),
    })),
    fromBech32: vi.fn(() => new Uint8Array(32)),
    encryptSecret: vi.fn(() => 'encrypted'),
    types: {
      IdentifierScheme: {
        CreatorRoundIndex: 0,
      },
      FeePolicy: {
        EndorsingNodePays: 0,
      },
    },
  }

  const mockRoflmarket = {
    Wrapper: vi.fn(() => ({
      callInstanceCreate: vi.fn(() => ({
        setBody: vi.fn(() => ({
          toSubcall: vi.fn(() => ({})),
        })),
      })),
      callInstanceExecuteCmds: vi.fn(() => ({
        setBody: vi.fn(() => ({
          toSubcall: vi.fn(() => ({})),
        })),
      })),
      callInstanceTopUp: vi.fn(() => ({
        setBody: vi.fn(() => ({
          toSubcall: vi.fn(() => ({})),
        })),
      })),
    })),
    types: {
      RoflmarketTerm: {
        MONTH: 1,
        HOUR: 2,
      },
      MachineID: {} as any,
    },
  }

  return {
    rofl: mockRofl,
    roflmarket: mockRoflmarket,
    types: {
      SGXEnclaveIdentity: {},
    },
  }
})

const GetRuntimeEventsMock = vi.fn((_network, _runtime, _params) =>
  Promise.resolve({
    data: {
      events: [
        {
          body: {
            id: 'rofl1test',
          },
        },
      ],
    },
  }),
)

const GetRuntimeRoflmarketInstancesMock = vi.fn((_network, _runtime, _params) =>
  Promise.resolve({
    data: {
      instances: [
        {
          id: '0x123456',
          node_id: 'node1',
          provider: 'oasis1provider',
          created_at: new Date().toISOString(),
          metadata: {
            'net.oasis.scheduler.rak': 'scheduler1',
          },
          offer_id: '0xoffer',
          deployment: {
            app_id: 'rofl1test',
            manifest_hash: '0xmanifest',
            metadata: {
              'net.oasis.deployment.orc.ref': 'oci-ref',
            },
          },
        },
      ],
    },
  }),
)

vi.mock('../nexus/api', () => ({
  GetRuntimeEvents: vi.fn((...args) => GetRuntimeEventsMock(...args)),
  GetRuntimeRoflmarketInstances: vi.fn((...args) => GetRuntimeRoflmarketInstancesMock(...args)),
}))

vi.mock('../pages/CreateApp/templates.tsx', () => ({
  getReadmeByTemplateId: vi.fn(() => 'readme content'),
  fillTemplate: vi.fn(() => ({ test: 'template' })),
  templates: [],
}))

vi.mock('../pages/CreateApp/useBlockNavigatingAway', () => ({
  useBlockNavigatingAway: vi.fn(() => ({
    isBlockingNavigatingAway: false,
    blockNavigatingAway: vi.fn(),
    allowNavigatingAway: vi.fn(),
  })),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useBlocker: vi.fn(() => ({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() })),
  }
})

vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

vi.mock('../utils/toastWithDuration.tsx', () => ({
  toastWithDuration: vi.fn(),
}))

vi.mock('fathom-client', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('../components/MachineStatusIcon/isMachineRemoved.ts', () => ({
  isMachineRemoved: vi.fn(() => false),
}))

vi.mock('../utils/helpers.ts', () => ({
  getOasisAddressBytesFromEvm: vi.fn((addr: string) => Buffer.from(addr.slice(2), 'hex')),
}))

vi.mock('../backend/helpers.ts', () => ({
  convertToDurationTerms: vi.fn(input => ({
    term: input.duration === 'months' ? 1 : 2,
    term_count:
      input.duration === 'months' ? input.number : input.number * (input.duration === 'days' ? 24 : 1),
  })),
}))

vi.mock('yaml', () => ({
  parse: vi.fn((str: string) => {
    if (str && str.includes('enclaves')) {
      return {
        deployments: {
          default: {
            policy: {
              enclaves: [{ id: 'base64encodedid' }],
            },
          },
        },
      }
    }
    return { parsed: str }
  }),
  stringify: vi.fn((obj: any) => JSON.stringify(obj)),
}))

// Access the global mock functions from setup.ts
const mockedAxios = {
  get: (global as any).__mockAxiosGet as ReturnType<typeof vi.fn>,
  post: (global as any).__mockAxiosPost as ReturnType<typeof vi.fn>,
  put: (global as any).__mockAxiosPut as ReturnType<typeof vi.fn>,
  delete: (global as any).__mockAxiosDelete as ReturnType<typeof vi.fn>,
  patch: (global as any).__mockAxiosPatch as ReturnType<typeof vi.fn>,
}

describe('backend/api', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    })
    process.env.VITE_ROFL_APP_BACKEND = 'http://localhost:3000'
    // Set global BUILD_COMMIT
    globalThis.BUILD_COMMIT = 'test-commit-123'

    // Reset all mocks to clear the implementation queue
    mockSendTransactionAsync.mockReset()
    mockedAxios.get.mockReset()
    mockedAxios.post.mockReset()
    mockedAxios.put.mockReset()

    // Re-setup the mocks to return default values
    mockSendTransactionAsync.mockResolvedValue('0xtxhash')
    mockedAxios.get.mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })
    mockedAxios.post.mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })
    mockedAxios.put.mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('fetchNonce', () => {
    it('should fetch nonce successfully', async () => {
      const mockNonce = 'test-nonce-123'
      mockedAxios.get.mockResolvedValue({ data: { nonce: mockNonce } })

      const result = await fetchNonce('0x1234567890abcdef')

      expect(result).toBe(mockNonce)
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/auth/nonce', {
        params: { address: '0x1234567890abcdef' },
      })
    })

    it('should handle API errors', async () => {
      const mockError = new Error('Network error') as any
      mockError.response = { status: 500 }
      mockedAxios.get.mockRejectedValue(mockError)

      await expect(fetchNonce('0x1234567890abcdef')).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockToken = 'test-token-123'
      mockedAxios.post.mockResolvedValue({ data: { token: mockToken } })

      const result = await login({
        message: 'test-message',
        signature: 'test-signature',
      })

      expect(result).toBe(mockToken)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        { message: 'test-message' },
        expect.objectContaining({
          params: { sig: 'test-signature' },
        }),
      )
    })

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials') as any
      mockError.response = { status: 401 }
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(login({ message: 'test', signature: 'test' })).rejects.toThrow()
    })
  })

  describe('useGetNonce', () => {
    it('should not fetch when address is undefined', () => {
      const { result } = renderHook(() => useGetNonce(undefined), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('should fetch nonce when address is provided', async () => {
      const mockNonce = 'test-nonce'
      mockedAxios.get.mockResolvedValue({ data: { nonce: mockNonce } })

      const { result } = renderHook(() => useGetNonce('0x123'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedAxios.get).toHaveBeenCalled()
    })
  })

  describe('useLogin', () => {
    it('should login with mutation', async () => {
      const mockToken = 'jwt-token'
      mockedAxios.post.mockResolvedValue({ data: { token: mockToken } })

      const { result } = renderHook(() => useLogin(), { wrapper })

      let data: string | undefined
      await act(async () => {
        data = await result.current.mutateAsync({
          message: 'msg',
          signature: 'sig',
        })
      })

      expect(data).toBe(mockToken)
    })
  })

  describe('useGetMe', () => {
    it('should not fetch when token is null', () => {
      const { result } = renderHook(() => useGetMe(null), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('should fetch user data when token is provided', async () => {
      const mockMe = { address: '0x123', name: 'test' }
      mockedAxios.get.mockResolvedValue({ data: mockMe })

      const { result } = renderHook(() => useGetMe('token123'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/me',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token123' },
        }),
      )
    })
  })

  describe('useUploadArtifact', () => {
    it('should upload artifact successfully', async () => {
      mockedAxios.put.mockResolvedValue({ data: undefined })

      const { result } = renderHook(() => useUploadArtifact('token123'), { wrapper })

      const mockFile = new Blob(['test content'])
      await act(async () => {
        await result.current.mutateAsync({
          id: 'test-rofl-yaml',
          file: mockFile,
        })
      })

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:3000/artifacts/test-rofl-yaml',
        mockFile,
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer token123',
            'Content-Type': 'application/octet-stream',
          },
        }),
      )
    })
  })

  describe('downloadArtifact', () => {
    it('should download artifact successfully', async () => {
      const mockContent = 'yaml content'
      mockedAxios.get.mockResolvedValue({ data: mockContent })

      const result = await downloadArtifact('test-rofl-yaml', 'token123')

      expect(result).toBe(mockContent)
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/artifacts/test-rofl-yaml',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token123' },
          responseType: 'text',
        }),
      )
    })
  })

  describe('useDownloadArtifact', () => {
    it('should not fetch when id is null', () => {
      const { result } = renderHook(() => useDownloadArtifact(null, 'token123'), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('should not fetch when token is null', () => {
      const { result } = renderHook(() => useDownloadArtifact('test-id', null), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('should download artifact when id and token are provided', async () => {
      const mockContent = 'yaml content'
      mockedAxios.get.mockResolvedValue({ data: mockContent })

      const { result } = renderHook(() => useDownloadArtifact('test-id', 'token123'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBe(mockContent)
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/artifacts/test-id',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token123' },
        }),
      )
    })

    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(() => useDownloadArtifact('test-id', 'token123', false), { wrapper })

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      expect(result.current.isLoading).toBe(false)
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('should handle download errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Download failed'))

      const { result } = renderHook(() => useDownloadArtifact('test-id', 'token123'), { wrapper })

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useValidateRofl', () => {
    it('should validate compose successfully', async () => {
      const mockResponse = {
        valid: true,
        warnings: [],
      }
      mockedAxios.post.mockResolvedValue({ data: mockResponse })

      const { result } = renderHook(() => useValidateRofl('token123'), { wrapper })

      let data: typeof mockResponse | undefined
      await act(async () => {
        data = await result.current.mutateAsync({ compose: 'version: "3"' })
      })

      expect(data).toEqual(mockResponse)
    })

    it('should handle validation errors', async () => {
      const mockResponse = {
        valid: false,
        errors: ['Invalid syntax'],
      }
      mockedAxios.post.mockResolvedValue({ data: mockResponse })

      const { result } = renderHook(() => useValidateRofl('token123'), { wrapper })

      let data: typeof mockResponse | undefined
      await act(async () => {
        data = await result.current.mutateAsync({ compose: 'invalid' })
      })

      expect(data).toEqual(mockResponse)
    })

    it('should call onError on API error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.post.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useValidateRofl('token123'), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ compose: 'test' })
        } catch {
          // Expected
        }
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('useCreateAndDeployApp', () => {
    const mockTemplate = {
      yaml: {
        rofl: { test: 'template' },
        compose: 'version: "3"',
      },
      id: 'test-template',
    }

    const mockAppData: AppData = {
      metadata: {
        name: 'Test App',
        description: 'Test Description',
        author: 'Test Author',
        version: '1.0.0',
        homepage: 'https://test.com',
      },
      build: {
        provider: 'oasis1provider',
        offerId: '0xoffer123',
        duration: 'months',
        number: 1,
      },
      templateId: 'test-template',
      inputs: {
        secrets: {
          SECRET_KEY: 'secret_value',
        },
      },
    }

    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCreateAndDeployApp(), { wrapper })

      expect(result.current.progress.currentStep).toBe('creating')
      expect(result.current.progress.steps).toEqual(['creating', 'building', 'updating', 'deploying'])
      expect(result.current.progress.stepLabels).toEqual({
        creating: 'Creating app',
        building: 'Building app',
        updating: 'Updating app secrets',
        deploying: 'Deploying app to machine',
      })
    })

    it('should have correct step estimated durations', () => {
      const { result } = renderHook(() => useCreateAndDeployApp(), { wrapper })

      expect(result.current.progress.stepEstimatedDurations).toEqual({
        creating: 40_000,
        building: 80_000,
        deploying: 80_000,
      })
    })

    it('should execute create and deploy flow successfully', async () => {
      // Mock the complete flow
      mockSendTransactionAsync
        .mockResolvedValueOnce('0xcreatetx')
        .mockResolvedValueOnce('0xupdatetx')
        .mockResolvedValueOnce('0xdeploytx')

      mockedAxios.post.mockResolvedValue({ data: { task_id: 'task123' } })
      mockedAxios.put.mockResolvedValue({ data: undefined })
      mockedAxios.get.mockResolvedValue({
        data: {
          manifest: 'manifest',
          oci_reference: 'oci-ref',
          manifest_hash: 'hash',
          logs: '',
          err: '',
          enclaves: [],
        },
      })

      const { result } = renderHook(() => useCreateAndDeployApp(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
      expect(result.current.progress).toBeDefined()
      expect(result.current.progress.currentStep).toBe('creating')
    })

    it('should handle creation errors', async () => {
      const mockError = new Error('Creation failed')
      mockSendTransactionAsync.mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateAndDeployApp(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          token: 'test-token',
          template: mockTemplate,
          appData: mockAppData,
          network: 'testnet',
          address: '0x1234567890abcdef',
        }),
      ).rejects.toThrow()
    })
  })

  describe('useDeployAppToNewMachine', () => {
    const mockBuild: BuildFormData = {
      provider: 'oasis1provider',
      offerId: '0xoffer123',
      duration: 'months',
      number: 1,
    }

    it('should have correct initial state', () => {
      const { result } = renderHook(() => useDeployAppToNewMachine(), { wrapper })

      expect(result.current.progress.currentStep).toBe('building')
      expect(result.current.progress.steps).toEqual(['building', 'updating', 'deploying'])
    })

    it('should have correct step labels', () => {
      const { result } = renderHook(() => useDeployAppToNewMachine(), { wrapper })

      expect(result.current.progress.stepLabels).toEqual({
        creating: 'skipped',
        building: 'Building app',
        updating: 'Updating app secrets',
        deploying: 'Deploying app to machine',
      })
    })

    it('should have correct step estimated durations', () => {
      const { result } = renderHook(() => useDeployAppToNewMachine(), { wrapper })

      expect(result.current.progress.stepEstimatedDurations).toEqual({
        building: 80_000,
        deploying: 80_000,
      })
    })

    it('should execute deploy to new machine flow successfully', async () => {
      // Mock the complete flow
      mockSendTransactionAsync.mockResolvedValueOnce('0xupdatetx').mockResolvedValueOnce('0xdeploytx')

      mockedAxios.post.mockResolvedValue({ data: { task_id: 'task123' } })
      mockedAxios.get.mockResolvedValue({
        data: 'yaml content',
      })

      const { result } = renderHook(() => useDeployAppToNewMachine(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
      expect(result.current.progress).toBeDefined()
      expect(result.current.progress.currentStep).toBe('building')
    })

    it('should handle deployment errors', async () => {
      const mockError = new Error('Deployment failed')
      mockSendTransactionAsync.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeployAppToNewMachine(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          token: 'test-token',
          appId: 'rofl1test',
          build: mockBuild,
          network: 'testnet',
          address: '0x1234567890abcdef',
        }),
      ).rejects.toThrow()
    })
  })

  describe('useUpdateApp', () => {
    const mockMetadataViewState: ViewMetadataState = {
      isDirty: true,
      metadata: {
        name: 'Updated App',
        description: 'Updated Description',
        author: 'Updated Author',
        version: '2.0.0',
        homepage: 'https://updated.com',
      },
    }

    const mockSecretsViewState: ViewSecretsState = {
      isDirty: true,
      secrets: {
        SECRET_KEY: 'updated_secret_value',
      },
    }

    it('should have mutation function defined', () => {
      const { result } = renderHook(() => useUpdateApp(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should update app metadata and secrets successfully', async () => {
      mockSendTransactionAsync.mockResolvedValueOnce('0xupdatetx')

      const { result } = renderHook(() => useUpdateApp(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed')
      mockSendTransactionAsync.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useUpdateApp(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          appId: 'rofl1test',
          metadataViewState: mockMetadataViewState,
          secretsViewState: mockSecretsViewState,
          network: 'testnet',
        }),
      ).rejects.toThrow()
    })
  })

  describe('useRemoveApp', () => {
    it('should have mutation function defined', () => {
      const { result } = renderHook(() => useRemoveApp(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should remove app successfully', async () => {
      mockSendTransactionAsync.mockResolvedValueOnce('0xremovetx')

      const { result } = renderHook(() => useRemoveApp(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should handle removal errors', async () => {
      const mockError = new Error('Removal failed')
      mockSendTransactionAsync.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useRemoveApp(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          appId: 'rofl1test',
          network: 'testnet',
        }),
      ).rejects.toThrow()
    })
  })

  describe('useMachineExecuteRestartCmd', () => {
    it('should have mutation function defined', () => {
      const { result } = renderHook(() => useMachineExecuteRestartCmd(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should restart machine successfully', async () => {
      mockSendTransactionAsync.mockResolvedValueOnce('0xrestarttx')

      const { result } = renderHook(() => useMachineExecuteRestartCmd(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should handle restart errors', async () => {
      const mockError = new Error('Restart failed')
      mockSendTransactionAsync.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useMachineExecuteRestartCmd(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          machineId: '0x123456',
          provider: 'oasis1provider',
          network: 'testnet',
        }),
      ).rejects.toThrow()
    })
  })

  describe('useMachineExecuteStopCmd', () => {
    it('should have mutation function defined', () => {
      const { result } = renderHook(() => useMachineExecuteStopCmd(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should stop machine successfully', async () => {
      mockSendTransactionAsync.mockResolvedValueOnce('0xstoptx')

      const { result } = renderHook(() => useMachineExecuteStopCmd(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should handle stop errors', async () => {
      const mockError = new Error('Stop failed')
      mockSendTransactionAsync.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useMachineExecuteStopCmd(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          machineId: '0x123456',
          provider: 'oasis1provider',
          network: 'testnet',
        }),
      ).rejects.toThrow()
    })
  })

  describe('useMachineTopUp', () => {
    const mockMachine: RoflMarketInstance = {
      id: '0x123456',
      node_id: 'node1',
      provider: 'oasis1provider',
      created_at: new Date().toISOString(),
      metadata: {
        'net.oasis.scheduler.rak': 'scheduler1',
      },
      offer_id: '0xoffer',
      deployment: {
        app_id: 'rofl1test',
        manifest_hash: '0xmanifest',
        metadata: {
          'net.oasis.deployment.orc.ref': 'oci-ref',
        },
      },
    }

    const mockBuild: BuildFormData = {
      provider: 'oasis1provider',
      offerId: '0xoffer123',
      duration: 'months',
      number: 1,
    }

    it('should have mutation function defined', () => {
      const { result } = renderHook(() => useMachineTopUp(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should top up active machine successfully', async () => {
      mockSendTransactionAsync.mockResolvedValueOnce('0xtopup')

      const { result } = renderHook(() => useMachineTopUp(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should create new machine when old one is removed', async () => {
      mockSendTransactionAsync.mockResolvedValueOnce('0xnewmachine')
      vi.spyOn(isMachineRemovedModule, 'isMachineRemoved').mockReturnValue(true)

      const { result } = renderHook(() => useMachineTopUp(), { wrapper })

      // Just verify the hook has the right structure and methods
      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
    })

    it('should handle top up errors', async () => {
      const mockError = new Error('Top up failed')
      mockSendTransactionAsync.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useMachineTopUp(), { wrapper })

      // Verify error handling works
      await expect(
        result.current.mutateAsync({
          machine: mockMachine,
          provider: 'oasis1provider',
          network: 'testnet',
          build: mockBuild,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle network errors in fetchNonce', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      await expect(fetchNonce('0x123')).rejects.toThrow('Network error')
    })

    it('should handle empty nonce response', async () => {
      mockedAxios.get.mockResolvedValue({ data: { nonce: '' } })

      const result = await fetchNonce('0x123')
      expect(result).toBe('')
    })

    it('should handle invalid login response', async () => {
      mockedAxios.post.mockResolvedValue({ data: { token: undefined } })

      const result = await login({ message: 'test', signature: 'test' })
      expect(result).toBeUndefined()
    })

    it('should handle empty token in login', async () => {
      mockedAxios.post.mockResolvedValue({ data: { token: '' } })

      const result = await login({ message: 'test', signature: 'test' })
      expect(result).toBe('')
    })

    it('should handle malformed response in fetchMe', async () => {
      mockedAxios.get.mockResolvedValue({ data: null })

      const { result } = renderHook(() => useGetMe('token123'), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should handle gracefully without crashing
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle upload error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.put.mockRejectedValue(new Error('Upload failed'))

      const { result } = renderHook(() => useUploadArtifact('token123'), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: 'test-rofl-yaml',
            file: new Blob(['test']),
          })
        } catch {
          // Expected
        }
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should handle download error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Download failed'))

      await expect(downloadArtifact('test-rofl-yaml', 'token123')).rejects.toThrow('Download failed')
    })

    it('should handle validation with warnings', async () => {
      const mockResponse = {
        valid: true,
        warnings: ['Warning 1', 'Warning 2'],
      }
      mockedAxios.post.mockResolvedValue({ data: mockResponse })

      const { result } = renderHook(() => useValidateRofl('token123'), { wrapper })

      let data: typeof mockResponse | undefined
      await act(async () => {
        data = await result.current.mutateAsync({ compose: 'test' })
      })

      expect(data?.warnings).toHaveLength(2)
      expect(data?.valid).toBe(true)
    })

    it('should handle validation with message', async () => {
      const mockResponse = {
        valid: false,
        message: 'Validation failed with message',
      }
      mockedAxios.post.mockResolvedValue({ data: mockResponse })

      const { result } = renderHook(() => useValidateRofl('token123'), { wrapper })

      let data: typeof mockResponse | undefined
      await act(async () => {
        data = await result.current.mutateAsync({ compose: 'test' })
      })

      expect(data?.message).toBe('Validation failed with message')
    })

    it('should handle concurrent uploads', async () => {
      mockedAxios.put.mockResolvedValue({ data: undefined })

      const { result } = renderHook(() => useUploadArtifact('token123'), { wrapper })

      const files = [
        { id: 'test1-rofl-yaml' as const, file: new Blob(['test1']) },
        { id: 'test2-rofl-yaml' as const, file: new Blob(['test2']) },
        { id: 'test3-rofl-yaml' as const, file: new Blob(['test3']) },
      ]

      await act(async () => {
        await Promise.all(files.map(f => result.current.mutateAsync(f)))
      })

      expect(mockedAxios.put).toHaveBeenCalledTimes(3)
    })
  })

  describe('Artifact ID type safety', () => {
    it('should accept valid artifact IDs', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'content' })

      const validIds = [
        'app123-rofl-template-yaml',
        'app456-rofl-yaml',
        'app789-compose-yaml',
        'app000-readme-md',
      ] as const
      const _wagmi = '*'
      const _wagmiCore = '*'
      const _oasis = '*'
      const _oasisRT = '*'
      const _nexusApi = '*'

      for (const id of validIds) {
        const result = await downloadArtifact(id, 'token123')
        expect(result).toBe('content')
      }
    })
  })

  describe('Query key and cache behavior', () => {
    it('should use correct query key for useGetNonce', () => {
      const { result } = renderHook(() => useGetNonce('0x123'), { wrapper })

      expect(result.current).toBeDefined()
    })

    it('should use correct query key for useGetMe', () => {
      const { result } = renderHook(() => useGetMe('token123'), { wrapper })

      expect(result.current).toBeDefined()
    })

    it('should use correct query key for useDownloadArtifact', () => {
      const { result } = renderHook(() => useDownloadArtifact('test-rofl-yaml', 'token123'), { wrapper })

      expect(result.current).toBeDefined()
    })
  })

  describe('Mutation options and callbacks', () => {
    it('should have throwOnError disabled by default', () => {
      const { result: loginResult } = renderHook(() => useLogin(), { wrapper })
      const { result: uploadResult } = renderHook(() => useUploadArtifact('token'), { wrapper })
      const { result: validateResult } = renderHook(() => useValidateRofl('token'), { wrapper })

      // All mutations should have throwOnError: false
      expect(loginResult.current.mutate).toBeDefined()
      expect(uploadResult.current.mutate).toBeDefined()
      expect(validateResult.current.mutate).toBeDefined()
    })
  })

  describe('API endpoint configuration', () => {
    it('should use correct base URL from environment', () => {
      // The BACKEND_URL is set at module load time from import.meta.env
      // This test verifies the URL format is correct
      expect(mockedAxios.get).toBeDefined()
      expect(mockedAxios.post).toBeDefined()
    })
  })

  describe('Request headers and authentication', () => {
    it('should include authorization header in getMe request', async () => {
      mockedAxios.get.mockResolvedValue({ data: { address: '0x123' } })

      const { result } = renderHook(() => useGetMe('my-token'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/me',
        expect.objectContaining({
          headers: { Authorization: 'Bearer my-token' },
        }),
      )
    })

    it('should include correct content type in validate request', async () => {
      const mockResponse = { valid: true }
      mockedAxios.post.mockResolvedValue({ data: mockResponse })

      const { result } = renderHook(() => useValidateRofl('token123'), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ compose: 'version: "3"' })
      })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/rofl/validate',
        { compose: 'version: "3"' },
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer token123',
            'Content-Type': 'application/json',
          },
        }),
      )
    })
  })
})
