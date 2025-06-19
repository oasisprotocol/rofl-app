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

type UploadArtifactRequest = {
  id: string;
  content: string;
};

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

const uploadArtifact = async (
  id: string,
  content: string,
  token: string
): Promise<void> => {
  await axios.put(`${BACKEND_URL}/artifacts/${id}`, content, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
  });
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

export function useUploadArtifact(token: string | null) {
  return useMutation<void, AxiosError<unknown>, UploadArtifactRequest>({
    mutationFn: ({ id, content }) => uploadArtifact(id, content, token!),
    throwOnError: false,
  });
}
