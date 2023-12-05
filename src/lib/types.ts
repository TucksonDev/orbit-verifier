// Note: The abi types from the RollupCore__factory and the ArbySys__factory classes in the SDK are not compatible with viem.
//  This types is a generic Abi type to solve that issue
export type AbiItem = {
  inputs: { internalType: string; name: string; type: string }[];
  name: string;
  outputs: { internalType: string; name: string; type: string }[];
  stateMutability: string;
  type: string;
};
export type Abi = AbiItem[];

export type AbiEventItem = {
  inputs: { indexed: boolean; internalType: string; name: string; type: string }[];
  name: string;
  type: 'event';
};
export type AbiEvent = AbiEventItem[];

export type RollupCreatedEventAddresses = {
  rollupAddress: `0x${string}`;
  nativeToken?: `0x${string}`;
  inboxAddress: `0x${string}`;
  outbox: `0x${string}`;
  rollupEventInbox: `0x${string}`;
  challengeManager: `0x${string}`;
  adminProxy: `0x${string}`;
  sequencerInbox: `0x${string}`;
  bridge: `0x${string}`;
  upgradeExecutor: `0x${string}`;
  validatorUtils: `0x${string}`;
  validatorWalletCreator: `0x${string}`;
};

export type RollupInformationFromRollupCreatedEvent = {
  rollupCreatorAddress: `0x${string}`;
  rollupAddresses?: RollupCreatedEventAddresses;
};
