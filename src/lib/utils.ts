import { ChainLayer, OrbitHandler } from './client';
import { ERC1967Upgrade__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ERC1967Upgrade__factory';
import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { AbiEventItem } from './types';
import { supportedRollupCreatedEvents } from './abis';
import { decodeEventLog } from 'viem';

type AdminChangedArgs = {
  previousAdmin: `0x${string}`;
  newAdmin: `0x${string}`;
};

export const getCurrentAdminOfContract = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  contractAddress: `0x${string}`,
): Promise<`0x${string}` | undefined> => {
  const adminChangedEvents = await orbitHandler.getLogs(
    chainLayer,
    contractAddress,
    ERC1967Upgrade__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'AdminChanged',
    )[0] as AbiEventItem,
    undefined,
    'earliest',
    'latest',
  );
  if (!adminChangedEvents || adminChangedEvents.length <= 0) {
    return undefined;
  }

  const latestAdminChangedLog = adminChangedEvents.reduce((latestLog, currentLog) => {
    return !latestLog || currentLog.blockNumber! > latestLog.blockNumber! ? currentLog : latestLog;
  });

  return (latestAdminChangedLog.args as AdminChangedArgs).newAdmin;
};

//
// Requiremenets to finding this information:
//    - Rollup contract should have emitted a RollupInitialized event
export const getRollupCreatedLogFromRollupAddress = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  rollupAddress: `0x${string}`,
) => {
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
  let rollupCreatedLog = {};
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
      rollupCreatedLog = decodedLog.args;
      break;
    } catch (err) {
      // Silently continue
    }
  }

  return rollupCreatedLog;
};
