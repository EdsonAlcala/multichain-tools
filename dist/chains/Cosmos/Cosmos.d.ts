import { type ChainSignatureContracts, type NearAuthentication } from '../types';
import { type KeyDerivationPath } from '../../kdf/types';
import { type CosmosTransaction, type CosmosNetworkIds } from './types';
import { type MPCSignature, type RSVSignature } from '../../signature/types';
export declare class Cosmos {
    private readonly registry;
    private readonly contract;
    private readonly chainId;
    private readonly signer;
    constructor({ contract, chainId, signer, }: {
        contract: ChainSignatureContracts;
        chainId: CosmosNetworkIds;
        signer: (txHash: Uint8Array) => Promise<MPCSignature>;
    });
    private createSigner;
    parseRSVSignature(rsvSignature: RSVSignature): Uint8Array;
    private createFee;
    private updateMessages;
    handleTransaction(data: CosmosTransaction, nearAuthentication: NearAuthentication, path: KeyDerivationPath): Promise<string>;
}
