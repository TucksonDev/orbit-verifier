import { createPublicClient, http } from 'viem';
import { defineChainInformation, getChainInfoFromChainId } from '../utils';

type Abi = {
  inputs: { internalType: string; name: string; type: string }[];
  name: string;
  outputs: { internalType: string; name: string; type: string }[];
  stateMutability: string;
  type: string;
}[];

export class OrbitHandler {
  parentChainPublicClient;
  orbitPublicClient;

  constructor(parentChainId: number, orbitChainId: number, orbitChainRpc: string) {
    // Get chains information
    const parentChainInformation = getChainInfoFromChainId(parentChainId);
    const orbitChainInformation = defineChainInformation(orbitChainId, orbitChainRpc);

    // Create public clients
    this.parentChainPublicClient = createPublicClient({
      chain: parentChainInformation,
      transport: http(),
    });
    this.orbitPublicClient = createPublicClient({
      chain: orbitChainInformation,
      transport: http(),
    });
  }

  readContract = async (
    chain: 'parent' | 'orbit',
    address: `0x${string}`,
    abi: Abi,
    functionName: string,
    args: any[] = [],
  ) => {
    const client = chain === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    const result = await client.readContract({
      address,
      abi,
      functionName,
      args,
    });

    return result;
  };
}
