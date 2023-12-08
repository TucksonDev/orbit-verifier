// Missing and other supported ABIs
import { AbiItem, keccak256, toHex } from 'viem';

//
// Canonical RollupCreator
//
export const CanonicalCreateRollupAbi: AbiItem = {
  inputs: [
    {
      components: [
        {
          components: [
            { internalType: 'uint64', name: 'confirmPeriodBlocks', type: 'uint64' },
            { internalType: 'uint64', name: 'extraChallengeTimeBlocks', type: 'uint64' },
            { internalType: 'address', name: 'stakeToken', type: 'address' },
            { internalType: 'uint256', name: 'baseStake', type: 'uint256' },
            { internalType: 'bytes32', name: 'wasmModuleRoot', type: 'bytes32' },
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'loserStakeEscrow', type: 'address' },
            { internalType: 'uint256', name: 'chainId', type: 'uint256' },
            { internalType: 'string', name: 'chainConfig', type: 'string' },
            { internalType: 'uint64', name: 'genesisBlockNum', type: 'uint64' },
            {
              components: [
                { internalType: 'uint256', name: 'delayBlocks', type: 'uint256' },
                { internalType: 'uint256', name: 'futureBlocks', type: 'uint256' },
                { internalType: 'uint256', name: 'delaySeconds', type: 'uint256' },
                { internalType: 'uint256', name: 'futureSeconds', type: 'uint256' },
              ],
              internalType: 'struct ISequencerInbox.MaxTimeVariation',
              name: 'sequencerInboxMaxTimeVariation',
              type: 'tuple',
            },
          ],
          internalType: 'struct Config',
          name: 'config',
          type: 'tuple',
        },
        { internalType: 'address', name: 'batchPoster', type: 'address' },
        { internalType: 'address[]', name: 'validators', type: 'address[]' },
        { internalType: 'uint256', name: 'maxDataSize', type: 'uint256' },
        { internalType: 'address', name: 'nativeToken', type: 'address' },
        { internalType: 'bool', name: 'deployFactoriesToL2', type: 'bool' },
        { internalType: 'uint256', name: 'maxFeePerGasForRetryables', type: 'uint256' },
      ],
      internalType: 'struct RollupCreator.RollupDeploymentParams',
      name: 'deployParams',
      type: 'tuple',
    },
  ],
  name: 'createRollup',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'payable',
  type: 'function',
};

export const CanonicalRollupCreatedEvent = {
  topic: keccak256(
    toHex(
      'RollupCreated(address,address,address,address,address,address,address,address,address,address,address,address)',
    ),
  ),
  abi: {
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rollupAddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nativeToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'inboxAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'outbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'rollupEventInbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'challengeManager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'adminProxy',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sequencerInbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'bridge',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'upgradeExecutor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'validatorUtils',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'validatorWalletCreator',
        type: 'address',
      },
    ],
    name: 'RollupCreated',
    type: 'event',
  },
};

//
// Old RollupCreator
//
export const OldCreateRollupAbi = {
  inputs: [
    {
      components: [
        { internalType: 'uint64', name: 'confirmPeriodBlocks', type: 'uint64' },
        { internalType: 'uint64', name: 'extraChallengeTimeBlocks', type: 'uint64' },
        { internalType: 'address', name: 'stakeToken', type: 'address' },
        { internalType: 'uint256', name: 'baseStake', type: 'uint256' },
        { internalType: 'bytes32', name: 'wasmModuleRoot', type: 'bytes32' },
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'loserStakeEscrow', type: 'address' },
        { internalType: 'uint256', name: 'chainId', type: 'uint256' },
        { internalType: 'string', name: 'chainConfig', type: 'string' },
        { internalType: 'uint64', name: 'genesisBlockNum', type: 'uint64' },
        {
          components: [
            { internalType: 'uint256', name: 'delayBlocks', type: 'uint256' },
            { internalType: 'uint256', name: 'futureBlocks', type: 'uint256' },
            { internalType: 'uint256', name: 'delaySeconds', type: 'uint256' },
            { internalType: 'uint256', name: 'futureSeconds', type: 'uint256' },
          ],
          internalType: 'struct ISequencerInbox.MaxTimeVariation',
          name: 'sequencerInboxMaxTimeVariation',
          type: 'tuple',
        },
      ],
      internalType: 'struct Config',
      name: 'config',
      type: 'tuple',
    },
    { internalType: 'address', name: '_batchPoster', type: 'address' },
    { internalType: 'address[]', name: '_validators', type: 'address[]' },
  ],
  name: 'createRollup',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'nonpayable',
  type: 'function',
};

export const OldRollupCreatedEvent = {
  topic: keccak256(
    toHex(
      'RollupCreated(address,address,address,address,address,address,address,address,address,address)',
    ),
  ),
  abi: {
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rollupAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'inboxAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'outbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'rollupEventInbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'challengeManager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'adminProxy',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sequencerInbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'bridge',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'validatorUtils',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'validatorWalletCreator',
        type: 'address',
      },
    ],
    name: 'RollupCreated',
    type: 'event',
  },
};

export const supportedCreateRollupAbis = [CanonicalCreateRollupAbi, OldCreateRollupAbi];
export const supportedRollupCreatedEvents = [CanonicalRollupCreatedEvent, OldRollupCreatedEvent];
