import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { Ownable__factory } from '@arbitrum/sdk/dist/lib/abi/factories/Ownable__factory';
//import { ProxyAdmin__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ProxyAdmin__factory';
import { OrbitHandler } from '../lib/client';
import { Abi, RollupCreatedEvent } from '../lib/types';
import { getCurrentAdminOfContract, getRollupCreatedLogFromRollupAddress } from '../lib/utils';

export const rollupHandler = async (orbitHandler: OrbitHandler, rollupAddress: `0x${string}`) => {
  //
  // Get RollupCreated log
  //
  console.log('Information from RollupCreated event');
  console.log('--------------');
  let proxyAdminAddress = '';
  let upgradeExecutorAddress = '';
  const rollupCreatedLogAddresses = (await getRollupCreatedLogFromRollupAddress(
    orbitHandler,
    'parent',
    rollupAddress,
  )) as RollupCreatedEvent;
  if (Object.keys(rollupCreatedLogAddresses).length <= 0) {
    console.log(`RollupCreated event could not be parsed. Continuing...`);
  } else {
    console.log(`Addresses on RollupCreated event:`, rollupCreatedLogAddresses);

    // Getting ProxyAdmin and UpgradeExecutor if present
    if (rollupCreatedLogAddresses.adminProxy) {
      proxyAdminAddress = rollupCreatedLogAddresses.adminProxy;
    }
    if (rollupCreatedLogAddresses.upgradeExecutor) {
      upgradeExecutorAddress = rollupCreatedLogAddresses.upgradeExecutor;
    }
  }
  console.log('');

  //
  // Get rollup information
  //
  console.log('Rollup contract addresses');
  console.log('--------------');
  const [bridgeAddress, inboxAddress, sequencerInboxAddress, outboxAddress, rollupOwner] =
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
  console.log('');

  //
  // Get contract owners/admins
  //
  console.log('Rollup contracts owners/admins');
  console.log('--------------');
  const [rollupAdmin, bridgeAdmin, inboxAdmin, sequencerInboxAdmin, outboxAdmin] =
    await Promise.all(
      [rollupAddress, bridgeAddress, inboxAddress, sequencerInboxAddress, outboxAddress].map(
        async (contractAddress) => {
          const address = (await getCurrentAdminOfContract(
            orbitHandler,
            'parent',
            contractAddress,
          )) as `0x${string}`;
          return address;
        },
      ),
    );

  /*
  const [
    bridgeAdminIsProxyAdmin,
    inboxAdminIsProxyAdmin,
    sequencerInboxAdminIsProxyAdmin,
    outboxAdminIsProxyAdmin,
  ] = await Promise.all(
    [bridgeAdmin, inboxAdmin, sequencerInboxAdmin, outboxAdmin].map(async (contractAddress) => {
      const accountBytecode = await orbitHandler.getBytecode('parent', contractAddress);
      console.log(accountBytecode?.toString());
      console.log(ProxyAdmin__factory.bytecode);
      return accountBytecode && accountBytecode.toString() == ProxyAdmin__factory.bytecode;
    }),
  );
  */

  console.log(
    `Rollup owner: ${rollupOwner}${
      upgradeExecutorAddress
        ? ' (' +
          (upgradeExecutorAddress == rollupOwner
            ? 'Is UpgradeExecutor'
            : 'Is NOT UpgradeExecutor') +
          ')'
        : ''
    }`,
  );
  console.log(`Rollup admin: ${rollupAdmin}`);
  console.log(
    `Bridge admin: ${bridgeAdmin}${
      proxyAdminAddress
        ? ' (' + (proxyAdminAddress == bridgeAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') + ')'
        : ''
    }`,
  );
  console.log(
    `Inbox admin: ${inboxAdmin}${
      proxyAdminAddress
        ? ' (' + (proxyAdminAddress == inboxAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') + ')'
        : ''
    }`,
  );
  console.log(
    `SequencerInbox admin: ${sequencerInboxAdmin}${
      proxyAdminAddress
        ? ' (' +
          (proxyAdminAddress == sequencerInboxAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') +
          ')'
        : ''
    }`,
  );
  console.log(
    `Outbox admin: ${outboxAdmin}${
      proxyAdminAddress
        ? ' (' + (proxyAdminAddress == outboxAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') + ')'
        : ''
    }`,
  );
  console.log('');

  //
  // ProxyAdmin and UpgradeExecutor verification
  //
  if (proxyAdminAddress) {
    console.log('ProxyAdmin owner');
    console.log('--------------');
    const proxyAdminOwner = (await orbitHandler.readContract(
      'parent',
      proxyAdminAddress as `0x${string}`,
      Ownable__factory.abi as Abi,
      'owner',
    )) as `0x${string}`;
    console.log(
      `ProxyAdmin owner: ${proxyAdminOwner}${
        upgradeExecutorAddress
          ? ' (' +
            (upgradeExecutorAddress == proxyAdminOwner
              ? 'Is UpgradeExecutor'
              : 'Is NOT UpgradeExecutor') +
            ')'
          : ''
      }`,
    );
  } else {
    console.log(
      `ProxyAdmin verification was skipped because it was not found in the RollupCreated event.`,
    );
  }
  if (upgradeExecutorAddress) {
    // Verify UpgradeExecutor admin privileges
  } else {
    console.log(
      `UpgradeExecutor verification was skipped because it was not found in the RollupCreated event.`,
    );
  }
  console.log('');
};
