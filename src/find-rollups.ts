import { createPublicClient, decodeEventLog, http, keccak256, toHex } from 'viem';
import { getChainInfoFromChainId } from './lib/utils';
import 'dotenv/config';
import { AbiEventItem } from './lib/types';
import { SequencerInbox__factory } from '@arbitrum/sdk/dist/lib/abi/factories/SequencerInbox__factory';

// Supported networks
const supportedChainIds = [1, 42161, 42170];

// Block range to search for recent events (24 hours)
const blockCountToSearchRecentEventsOnEth = BigInt((24 * 60 * 60) / 12.5);
const blockCountToSearchRecentEventsOnArb = BigInt((24 * 60 * 60) / 0.25);

// The default RPC for Ethereum on Viem has a restriction of 800 blocks max
// (this can be solved by defining a custom RPC in the .env file)
const defaultBlockCountToSearchRecentEventsOnEth = 800n;

type RollupInitializedEventArgs = {
  machineHash: `0x${string}`;
  chainId: bigint;
};

type RollupInformation = {
  chainId: bigint;
  transactionHash: `0x${string}`;
  rollupAddress?: `0x${string}`;
  sequencerInboxAddress?: `0x${string}`;
  isActive?: boolean;
};

const rollupInitializedEventAbi = {
  inputs: [
    {
      indexed: false,
      internalType: 'bytes32',
      name: 'machineHash',
      type: 'bytes32',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'chainId',
      type: 'uint256',
    },
  ],
  name: 'RollupInitialized',
  type: 'event',
};

type SequencerInboxUpdatedEventArgs = {
  newSequencerInbox: `0x${string}`;
};
const SequencerInboxUpdatedEventAbi = {
  inputs: [
    {
      indexed: false,
      internalType: 'address',
      name: 'newSequencerInbox',
      type: 'address',
    },
  ],
  name: 'SequencerInboxUpdated',
  type: 'event',
};
const SequencerInboxUpdatedEventTopic = keccak256(toHex('SequencerInboxUpdated(address)'));

const main = async (showInactive: boolean) => {
  for (const chainId of supportedChainIds) {
    const parentChainInformation = getChainInfoFromChainId(chainId);
    const isArbitrumChain = chainId != 1;
    const useCustomRPC = chainId == 1 && process.env.ETH_RPC;
    const clientTransport = useCustomRPC ? http(process.env.ETH_RPC) : http();
    const parentChainPublicClient = createPublicClient({
      chain: parentChainInformation,
      transport: clientTransport,
    });

    // eslint-disable-next-line no-await-in-loop
    const rollupInitializedEvents = await parentChainPublicClient.getLogs({
      event: rollupInitializedEventAbi as AbiEventItem,
      fromBlock: 'earliest',
      toBlock: 'latest',
    });

    // eslint-disable-next-line no-await-in-loop
    const rollupsInformation: RollupInformation[] = await Promise.all(
      rollupInitializedEvents.map(async (rollupInitializedEvent) => {
        const rollupInformation: RollupInformation = {
          chainId: (rollupInitializedEvent.args as RollupInitializedEventArgs).chainId,
          transactionHash: rollupInitializedEvent.transactionHash,
        };

        //
        // Checking if the chain has activity
        //

        // Get the transaction receipt
        const transactionReceipt = await parentChainPublicClient.getTransactionReceipt({
          hash: rollupInformation.transactionHash,
        });

        // Find the SequencerInboxUpdated log
        const sequencerInboxUpdatedEventLog = transactionReceipt.logs.filter(
          (log) => log.topics[0] == SequencerInboxUpdatedEventTopic,
        )[0];
        if (sequencerInboxUpdatedEventLog) {
          // Get the SequencerInbox address
          const decodedLog = decodeEventLog({
            abi: [SequencerInboxUpdatedEventAbi],
            data: sequencerInboxUpdatedEventLog.data,
            topics: sequencerInboxUpdatedEventLog.topics,
          });
          rollupInformation.sequencerInboxAddress = (
            decodedLog.args as SequencerInboxUpdatedEventArgs
          ).newSequencerInbox;

          // Get latest events of the contract
          const currentBlock = await parentChainPublicClient.getBlockNumber();
          const fromBlock =
            currentBlock -
            (useCustomRPC
              ? blockCountToSearchRecentEventsOnEth
              : isArbitrumChain
              ? blockCountToSearchRecentEventsOnArb
              : defaultBlockCountToSearchRecentEventsOnEth);
          const sequencerBatchDeliveredEventLogs = await parentChainPublicClient.getContractEvents({
            address: rollupInformation.sequencerInboxAddress,
            abi: SequencerInbox__factory.abi,
            eventName: 'SequencerBatchDelivered',
            fromBlock,
            toBlock: currentBlock,
          });
          rollupInformation.isActive = sequencerBatchDeliveredEventLogs.length > 0;

          // Get the rollup address
          rollupInformation.rollupAddress = (await parentChainPublicClient.readContract({
            address: rollupInformation.sequencerInboxAddress,
            abi: SequencerInbox__factory.abi,
            functionName: 'rollup',
          })) as `0x${string}`;
        }

        return rollupInformation;
      }),
    );

    // Filter inactives if needed
    const rollupsToShow = showInactive
      ? rollupsInformation
      : rollupsInformation.filter((rollupInformation) => rollupInformation.isActive);

    console.log('************************');
    console.log(`* Rollups in chainId = ${chainId}`);
    console.log('************************');
    if (rollupsToShow.length > 0) {
      rollupsToShow.forEach((rollupInformation) => {
        console.log('----------------------');
        console.log(rollupInformation);
        console.log('----------------------');
        console.log('');
      });
    }
    console.log(`Found ${rollupsToShow.length} rollups.`);
  }
};

// Getting argument for showing active rollups
const showInactive = process.argv.length >= 3 && process.argv[2] == 'showInactive' ? true : false;

// Calling main
main(showInactive)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
