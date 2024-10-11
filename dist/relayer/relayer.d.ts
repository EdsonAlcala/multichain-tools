import { type SignedDelegate } from '@near-js/transactions';
import { type SignedDelegateRelayerFormat } from './types';
/**
 * Parses the signedDelegate object from the Multi-Party Computation (MPC) format to the Relayer format.
 * @param signedDelegate - The signedDelegate object in MPC format.
 * @returns The signedDelegate object in Relayer format.
 */
export declare function parseSignedDelegateForRelayer(signedDelegate: SignedDelegate): SignedDelegateRelayerFormat;
