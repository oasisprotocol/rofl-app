import axios from 'axios';
import type { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

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
  manifest: number[];
  compose: number[];
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
