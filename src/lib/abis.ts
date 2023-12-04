// Missing and other supported ABIs
import { keccak256, toHex } from 'viem';

//
// Canonical RollupCreator
//
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

export const supportedRollupCreatedEvents = [CanonicalRollupCreatedEvent, OldRollupCreatedEvent];
