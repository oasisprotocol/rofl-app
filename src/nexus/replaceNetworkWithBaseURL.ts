import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

export const replaceNetworkWithBaseURL = <T>(
  config: AxiosRequestConfig,
  requestOverrides?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  if (config.url?.startsWith('/mainnet/')) {
    config.url = config.url.replace('/mainnet/', 'https://nexus.oasis.io/v1/');
  } else if (config.url?.startsWith('/testnet/')) {
    config.url = config.url.replace(
      '/testnet/',
      'https://testnet.nexus.oasis.io/v1/'
    );
  } else {
    throw new Error(`Expected URL to be prefixed with network: ${config.url}`);
  }

  return axios({ ...config, ...requestOverrides });
};

export default replaceNetworkWithBaseURL;
