/**
 * For now we want to whitelist only selected OPF providers based on
 * https://github.com/oasisprotocol/cli/blob/master/build/rofl/provider/defaults.go
 */
const WHITELISTED_PROVIDER_ADDRESSES = {
  mainnet: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr',
  testnet: 'oasis1qp2ens0hsp7gh23wajxa4hpetkdek3swyyulyrmz',
} as const;

type Provider = {
  address: string;
  metadata?: Record<string, unknown>;
};

export const getWhitelistedProviders = (
  providers: Provider[] | undefined,
  network: 'mainnet' | 'testnet'
) => {
  if (!providers) return [];

  const whitelistedAddress = WHITELISTED_PROVIDER_ADDRESSES[network];

  return providers.filter(
    (provider) => provider.address === whitelistedAddress
  );
};
