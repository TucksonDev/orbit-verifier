import { BlockNumber, BlockTag, GetLogsParameters, createPublicClient, http } from 'viem';
import { defineChainInformation, getChainInfoFromChainId } from '../utils';
import { Abi, AbiEventItem } from './types';

export type ChainLayer = 'parent' | 'orbit';

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

  getBytecode = async (chainLayer: ChainLayer, address: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    const result = await client.getBytecode({
      address,
    });

    return result;
  };

  getTransactionReceipt = async (chainLayer: ChainLayer, transactionHash: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    const result = await client.getTransactionReceipt({
      hash: transactionHash,
    });

    return result;
  };

  readContract = async (
    chainLayer: ChainLayer,
    address: `0x${string}`,
    abi: Abi,
    functionName: string,
    args: any[] = [],
  ) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    const result = await client.readContract({
      address,
      abi,
      functionName,
      args,
    });

    return result;
  };

  getLogs = async (
    chainLayer: ChainLayer,
    address: `0x${string}`,
    eventAbi: AbiEventItem,
    args?: GetLogsParameters,
    fromBlock?: BlockNumber | BlockTag,
    toBlock?: BlockNumber | BlockTag,
  ) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    const result = await client.getLogs({
      address,
      event: eventAbi,
      args,
      fromBlock,
      toBlock,
    });

    return result;
  };
}
