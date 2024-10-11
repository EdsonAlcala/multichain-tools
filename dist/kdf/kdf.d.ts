export declare function najPublicKeyStrToUncompressedHexPoint(najPublicKeyStr: string): string;
export declare function deriveChildPublicKey(parentUncompressedPublicKeyHex: string, signerId: string, path?: string): Promise<string>;
export declare const generateCompressedPublicKey: (signerId: string, path: string, publicKey: string) => Promise<string>;
