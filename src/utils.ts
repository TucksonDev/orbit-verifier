import { defineChain } from 'viem';
import { arbitrum, arbitrumNova, arbitrumGoerli, arbitrumSepolia } from 'viem/chains';

// Supported Viem chains
const supportedChains = { arbitrum, arbitrumNova, arbitrumGoerli, arbitrumSepolia };

export const getChainInfoFromChainId = (chainId: number) => {
  for (const chain of Object.values(supportedChains)) {
    if ('id' in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  return undefined;
};

export const defineChainInformation = (chainId: number, chainRpc: string) => {
  return defineChain({
    id: chainId,
    name: 'Orbit chain',
    network: 'orbit',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [chainRpc],
      },
      public: {
        http: [chainRpc],
      },
    },
  });
};
