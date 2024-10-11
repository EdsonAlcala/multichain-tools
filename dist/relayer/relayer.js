"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSignedDelegateForRelayer = void 0;
const bs58_1 = __importDefault(require("bs58"));
/**
 * Parses the signedDelegate object from the Multi-Party Computation (MPC) format to the Relayer format.
 * @param signedDelegate - The signedDelegate object in MPC format.
 * @returns The signedDelegate object in Relayer format.
 */
function parseSignedDelegateForRelayer(signedDelegate) {
    return {
        delegate_action: {
            actions: signedDelegate.delegateAction.actions
                .map((action) => {
                if (action.functionCall) {
                    return {
                        FunctionCall: {
                            method_name: action.functionCall.methodName,
                            args: Buffer.from(action.functionCall.args).toString('base64'),
                            gas: Number(action.functionCall.gas),
                            deposit: action.functionCall.deposit.toString(),
                        },
                    };
                }
                return undefined;
            })
                .flatMap((t) => (t ? [t] : [])),
            nonce: Number(signedDelegate.delegateAction.nonce),
            max_block_height: Number(signedDelegate.delegateAction.maxBlockHeight),
            public_key: signedDelegate.delegateAction.publicKey.toString(),
            receiver_id: signedDelegate.delegateAction.receiverId,
            sender_id: signedDelegate.delegateAction.senderId,
        },
        signature: `ed25519:${bs58_1.default.encode(signedDelegate.signature.data)}`,
    };
}
exports.parseSignedDelegateForRelayer = parseSignedDelegateForRelayer;
