import { ethers } from 'ethers';
import { type FetchEVMAddressRequest } from './types';
export declare function fetchEVMFeeProperties(providerUrl: string, transaction: ethers.TransactionLike): Promise<{
    gasLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    maxFee: bigint;
}>;
export declare function fetchDerivedEVMAddress({ signerId, path, nearNetworkId, multichainContractId, }: FetchEVMAddressRequest): Promise<string>;
