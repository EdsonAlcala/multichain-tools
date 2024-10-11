import { ethers } from 'ethers';
import { type ChainSignatureContracts, type NearAuthentication } from '../types';
import { type EVMTransaction } from './types';
import { type KeyDerivationPath } from '../../kdf/types';
import { type MPCSignature, type RSVSignature } from '../../signature/types';
export declare class EVM {
    private readonly provider;
    private readonly contract;
    private readonly signer;
    constructor(config: {
        providerUrl: string;
        contract: ChainSignatureContracts;
        signer: (txHash: Uint8Array) => Promise<MPCSignature>;
    });
    static prepareTransactionForSignature(transaction: ethers.TransactionLike): Uint8Array;
    sendSignedTransaction(transaction: ethers.TransactionLike, signature: ethers.SignatureLike): Promise<ethers.TransactionResponse>;
    attachGasAndNonce(transaction: Omit<EVMTransaction, 'from'> & {
        from: string;
    }): Promise<ethers.TransactionLike>;
    getBalance(address: string): Promise<string>;
    parseRSVSignature(rsvSignature: RSVSignature): ethers.Signature;
    handleTransaction(data: EVMTransaction, nearAuthentication: NearAuthentication, path: KeyDerivationPath): Promise<ethers.TransactionResponse | undefined>;
}
