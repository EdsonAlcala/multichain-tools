import { type BitcoinRequest } from './chains/Bitcoin/types';
import { type CosmosRequest } from './chains/Cosmos/types';
import { type EVMRequest } from './chains/EVM/types';
import { type Response } from './chains/types';
export declare const signAndSendEVMTransaction: (req: EVMRequest) => Promise<Response>;
export declare const signAndSendBTCTransaction: (req: BitcoinRequest) => Promise<Response>;
export declare const signAndSendCosmosTransaction: (req: CosmosRequest) => Promise<Response>;
