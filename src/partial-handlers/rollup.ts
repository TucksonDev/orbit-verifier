import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { Ownable__factory } from '@arbitrum/sdk/dist/lib/abi/factories/Ownable__factory';
import { OrbitHandler } from '../lib/client';
import { Abi } from '../lib/types';

export const rollupHandler = async (orbitHandler: OrbitHandler, rollupAddress: `0x${string}`) => {
  //
  // Get rollup information
  //
  console.log('Rollup contract addresses');
  console.log('--------------');
  const [bridgeAddress, inboxAddress, sequencerInboxAddress, outboxAddress, ownerAddress] =
    await Promise.all(
      ['bridge', 'inbox', 'sequencerInbox', 'outbox', 'owner'].map(async (functionName) => {
        const address = (await orbitHandler.readContract(
          'parent',
          rollupAddress,
          [...RollupCore__factory.abi, ...Ownable__factory.abi] as Abi,
          functionName,
        )) as `0x${string}`;
        return address;
      }),
    );

  console.log(`Rollup: ${rollupAddress}`);
  console.log(`Bridge: ${bridgeAddress}`);
  console.log(`Inbox: ${inboxAddress}`);
  console.log(`SequencerInbox: ${sequencerInboxAddress}`);
  console.log(`Outbox: ${outboxAddress}`);
  console.log(`Rollup owner: ${ownerAddress}`);
};
