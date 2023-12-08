import { ChainLayer, OrbitHandler } from './client';
import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { SequencerInbox__factory } from '@arbitrum/sdk/dist/lib/abi/factories/SequencerInbox__factory';
import {
  Abi,
  AbiEventItem,
  RollupCreatedEventAddresses,
  RollupCreatorInputParameters,
  RollupInformationFromRollupCreatedEvent,
} from './types';
import { supportedCreateRollupAbis, supportedRollupCreatedEvents } from './abis';
import { defineChain, decodeEventLog, getAddress, trim, decodeFunctionData } from 'viem';
import { mainnet, arbitrum, arbitrumNova, arbitrumGoerli, arbitrumSepolia } from 'viem/chains';

// Supported Viem chains
const supportedChains = { mainnet, arbitrum, arbitrumNova, arbitrumGoerli, arbitrumSepolia };

type RoleGrantedLogArgs = {
  role: `0x${string}`;
  account: `0x${string}`;
  sender: `0x${string}`;
};

type SetValidKeysetLogArgs = {
  keysetHash: `0x${string}`;
  keysetBytes: `0x${string}`;
};

type UpgradeExecutorPrivilegedAccounts = {
  // Key: account
  // Value: array of roles
  [key: `0x${string}`]: `0x${string}`[];
};

const RoleGrantedEventAbi: AbiEventItem = {
  inputs: [
    {
      indexed: true,
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'sender',
      type: 'address',
    },
  ],
  name: 'RoleGranted',
  type: 'event',
};

const RoleRevokedEventAbi: AbiEventItem = {
  inputs: [
    {
      indexed: true,
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'sender',
      type: 'address',
    },
  ],
  name: 'RoleGranted',
  type: 'event',
};

export const UpgradeExecutorRoles: {
  [key: `0x${string}`]: string;
} = {
  '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63': 'executor',
  '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775': 'admin',
};

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

export const getUpgradeExecutorPrivilegedAccounts = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  upgradeExecutorAddress: `0x${string}`,
): Promise<UpgradeExecutorPrivilegedAccounts | undefined> => {
  const privilegedAccounts: UpgradeExecutorPrivilegedAccounts = {};

  //
  // Find first the role granted events
  //
  const roleGrantedEvents = await orbitHandler.getLogs(
    chainLayer,
    upgradeExecutorAddress,
    RoleGrantedEventAbi,
    undefined,
    'earliest',
    'latest',
  );
  if (!roleGrantedEvents || roleGrantedEvents.length <= 0) {
    return undefined;
  }

  roleGrantedEvents.forEach((roleGrantedEvent) => {
    const account = (roleGrantedEvent.args as RoleGrantedLogArgs).account;
    const role = (roleGrantedEvent.args as RoleGrantedLogArgs).role;

    if (!(account in privilegedAccounts)) {
      privilegedAccounts[account] = [];
    }
    privilegedAccounts[account].push(role);
  });

  //
  // And then the role revoked events
  //
  const roleRevokedEvents = await orbitHandler.getLogs(
    chainLayer,
    upgradeExecutorAddress,
    RoleRevokedEventAbi,
    undefined,
    'earliest',
    'latest',
  );
  if (!roleRevokedEvents || roleRevokedEvents.length <= 0) {
    return privilegedAccounts;
  }

  roleRevokedEvents.forEach((roleRevokedEvent) => {
    const account = (roleRevokedEvent.args as RoleGrantedLogArgs).account;
    const role = (roleRevokedEvent.args as RoleGrantedLogArgs).role;

    const roleIndex = privilegedAccounts[account].findIndex((accRole) => accRole == role);
    if (roleIndex >= 0) {
      privilegedAccounts[account] = privilegedAccounts[account].splice(roleIndex, 1);
    }
  });

  return privilegedAccounts;
};

export const getCurrentAdminOfContract = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  contractAddress: `0x${string}`,
): Promise<`0x${string}` | undefined> => {
  const slot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
  const adminAddress = await orbitHandler.getStorageAt(chainLayer, contractAddress, slot);
  if (!adminAddress) {
    return getAddress('0x');
  }
  return getAddress(trim(adminAddress));
};

//
// Requiremenets to finding this information:
//    - Rollup contract should have emitted a RollupInitialized event
//    - RollupCreator should have emitted a RollupCreated event
export const getRollupInformationFromRollupCreator = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  rollupAddress: `0x${string}`,
): Promise<RollupInformationFromRollupCreatedEvent> => {
  // Step 1: find the RollupInitialized event from that Rollup contract
  const rollupInitializedEvents = await orbitHandler.getLogs(
    chainLayer,
    rollupAddress,
    RollupCore__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'RollupInitialized',
    )[0] as AbiEventItem,
    undefined,
    'earliest',
    'latest',
  );
  if (!rollupInitializedEvents || rollupInitializedEvents.length <= 0) {
    throw new Error(`No RollupInitialized event found for rollup address ${rollupAddress}`);
  }

  // Step 2: get the transaction hash that emitted that event
  const transactionHash = rollupInitializedEvents[0].transactionHash;
  if (!transactionHash) {
    throw new Error(
      `No transaction hash found in RollupInitialized event for rollup address ${rollupAddress}`,
    );
  }

  // Step 3: get all logs from that transaction
  const transactionReceipt = await orbitHandler.getTransactionReceipt(chainLayer, transactionHash);

  // Step 4: find RollupCreated log
  const rollupInformation: RollupInformationFromRollupCreatedEvent = {
    rollupCreatorAddress: getAddress(transactionReceipt.to!),
  };
  for (let i = 0; i < supportedRollupCreatedEvents.length; i++) {
    const currentRollupCreatedEventInfo = supportedRollupCreatedEvents[i];
    const rollupCreatedEventLog = transactionReceipt.logs.filter(
      (log) => log.topics[0] == currentRollupCreatedEventInfo.topic,
    )[0];
    if (!rollupCreatedEventLog) {
      continue;
    }

    try {
      const decodedLog = decodeEventLog({
        abi: [currentRollupCreatedEventInfo.abi],
        data: rollupCreatedEventLog.data,
        topics: rollupCreatedEventLog.topics,
      });
      rollupInformation.rollupAddresses = decodedLog.args as RollupCreatedEventAddresses;
      break;
    } catch (err) {
      // Silently continue
    }
  }

  // Step 5: Get input of the transaction
  const transaction = await orbitHandler.getTransaction(chainLayer, transactionHash);

  try {
    const { args } = decodeFunctionData({
      abi: supportedCreateRollupAbis,
      data: transaction.input,
    });
    const rollupParameters = args![0] as RollupCreatorInputParameters;
    rollupInformation.rollupParameters = rollupParameters;
    rollupInformation.rollupChainConfig = JSON.parse(rollupParameters.chainConfig);
  } catch (err) {
    // Silently continue
  }

  return rollupInformation;
};

export const getCurrentKeysetsForDAS = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  sequencerInboxAddress: `0x${string}`,
): Promise<`0x${string}`[]> => {
  // Step 1: Get all SetValidKeyset events from the SequencerInbox
  const setValidKeysetEvents = await orbitHandler.getLogs(
    chainLayer,
    sequencerInboxAddress,
    SequencerInbox__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'SetValidKeyset',
    )[0] as AbiEventItem,
    undefined,
    'earliest',
    'latest',
  );
  if (!setValidKeysetEvents || setValidKeysetEvents.length <= 0) {
    throw new Error(`No SetValidKeyset events found for SequencerInbox ${sequencerInboxAddress}`);
  }

  // Step 2: Verify which of the keysets is still valid
  const validKeysets: `0x${string}`[] = [];
  setValidKeysetEvents.forEach(async (setValidKeysetEvent) => {
    const keysetHash = (setValidKeysetEvent.args as SetValidKeysetLogArgs).keysetHash;
    const keysetIsValid = (await orbitHandler.readContract(
      'parent',
      sequencerInboxAddress,
      SequencerInbox__factory.abi as Abi,
      'isValidKeysetHash',
      [keysetHash],
    )) as boolean;

    console.log(keysetHash);
    if (keysetIsValid) {
      console.log('Is valid');
      validKeysets.push(keysetHash);
    } else {
      console.log('Is NOT valid');
    }
  });

  return validKeysets;
};

export const contractIsERC20 = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  address: `0x${string}`,
): Promise<boolean> => {
  const nativeTokenContractBytecode = await orbitHandler.getBytecode(chainLayer, address);

  if (!nativeTokenContractBytecode || nativeTokenContractBytecode == '0x') {
    return false;
  }

  return true;
};
