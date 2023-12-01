// Note: The abi types from the RollupCore__factory and the ArbySys__factory classes in the SDK are not compatible with viem.
//  This types is a generic Abi type to solve that issue
export type Abi = {
  inputs: {
    internalType: string;
    name: string;
    type: string;
  }[];
  name: string;
  outputs: {
    internalType: string;
    name: string;
    type: string;
  }[];
  stateMutability: string;
  type: string;
}[];
