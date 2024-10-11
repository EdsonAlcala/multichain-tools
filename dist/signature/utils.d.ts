import { type MPCSignature, type RSVSignature } from './types';
import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
export declare const NEAR_MAX_GAS: any;
export declare const toRSV: (signature: MPCSignature) => RSVSignature;
type SetConnectionArgs = {
    networkId: string;
    accountId: string;
    keypair: KeyPair;
} | {
    networkId: string;
    accountId?: never;
    keypair?: never;
};
export declare const getNearAccount: ({ networkId, accountId, keypair, }: SetConnectionArgs) => Promise<Account>;
export {};
