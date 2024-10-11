import { type Account, Contract } from '@near-js/accounts';
import BN from 'bn.js';
import { type MPCSignature } from './types';
import { type NearNetworkIds, type ChainSignatureContracts, type NearAuthentication } from '../chains/types';
import { type KeyDerivationPath } from '../kdf/types';
interface SignArgs {
    payload: number[];
    path: string;
    key_version: number;
}
type MultiChainContract = Contract & {
    public_key: () => Promise<string>;
    sign: (args: {
        args: {
            request: SignArgs;
        };
        gas: BN;
        amount: BN;
    }) => Promise<MPCSignature>;
    experimental_signature_deposit: () => Promise<number>;
};
export declare const ChainSignaturesContract: {
    getContract: ({ account, contract, }: {
        account: Account;
        contract: ChainSignatureContracts;
    }) => MultiChainContract;
    getPublicKey: ({ networkId, contract, }: {
        networkId: NearNetworkIds;
        contract: ChainSignatureContracts;
    }) => Promise<string | undefined>;
    getCurrentFee: ({ networkId, contract, }: {
        networkId: NearNetworkIds;
        contract: ChainSignatureContracts;
    }) => Promise<BN | undefined>;
    sign: ({ hashedTx, path, nearAuthentication, contract, relayerUrl, }: {
        hashedTx: Uint8Array;
        path: KeyDerivationPath;
        nearAuthentication: NearAuthentication;
        contract: ChainSignatureContracts;
        relayerUrl?: string | undefined;
    }) => Promise<MPCSignature>;
};
export {};
