"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cosmos = void 0;
const stargate_1 = require("@cosmjs/stargate");
const proto_signing_1 = require("@cosmjs/proto-signing");
const encoding_1 = require("@cosmjs/encoding");
const crypto_1 = require("@cosmjs/crypto");
const utils_1 = require("./utils");
const utils_2 = require("../../signature/utils");
class Cosmos {
    // TODO: should include providerUrl, so the user can choose rpc
    constructor({ contract, chainId, signer, }) {
        this.registry = new proto_signing_1.Registry();
        this.contract = contract;
        this.chainId = chainId;
        this.signer = signer;
    }
    createSigner(address, publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                getAccounts: () => __awaiter(this, void 0, void 0, function* () {
                    return [
                        {
                            address,
                            algo: 'secp256k1',
                            pubkey: publicKey,
                        },
                    ];
                }),
                signDirect: (signerAddress, signDoc) => __awaiter(this, void 0, void 0, function* () {
                    if (signerAddress !== address) {
                        throw new Error(`Address ${signerAddress} not found in wallet`);
                    }
                    const txHash = (0, crypto_1.sha256)((0, proto_signing_1.makeSignBytes)(signDoc));
                    const mpcSignature = yield this.signer(txHash);
                    const signature = this.parseRSVSignature((0, utils_2.toRSV)(mpcSignature));
                    return {
                        signed: signDoc,
                        signature: {
                            pub_key: {
                                type: 'tendermint/PubKeySecp256k1',
                                value: (0, encoding_1.toBase64)(publicKey),
                            },
                            signature: (0, encoding_1.toBase64)(signature),
                        },
                    };
                }),
            };
        });
    }
    parseRSVSignature(rsvSignature) {
        return new Uint8Array([
            ...(0, encoding_1.fromHex)(rsvSignature.r),
            ...(0, encoding_1.fromHex)(rsvSignature.s),
        ]);
    }
    createFee(denom, gasPrice, gas) {
        const gasLimit = gas || 200000;
        return (0, stargate_1.calculateFee)(gasLimit, stargate_1.GasPrice.fromString(`${gasPrice}${denom}`));
    }
    updateMessages(messages, address) {
        return messages.map((msg) => !msg.value.fromAddress
            ? Object.assign(Object.assign({}, msg), { value: Object.assign(Object.assign({}, msg.value), { fromAddress: address }) }) : msg);
    }
    handleTransaction(data, nearAuthentication, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const { prefix, denom, rpcUrl, gasPrice } = yield (0, utils_1.fetchChainInfo)(this.chainId);
            const { address, publicKey } = yield (0, utils_1.fetchDerivedCosmosAddressAndPublicKey)({
                signerId: nearAuthentication.accountId,
                path,
                nearNetworkId: nearAuthentication.networkId,
                multichainContractId: this.contract,
                prefix,
            });
            const signer = yield this.createSigner(address, publicKey);
            const client = yield stargate_1.SigningStargateClient.connectWithSigner(rpcUrl, signer, {
                registry: this.registry,
                gasPrice: stargate_1.GasPrice.fromString(`${gasPrice}${denom}`),
            });
            const fee = this.createFee(denom, gasPrice, data.gas);
            const updatedMessages = this.updateMessages(data.messages, address);
            const result = yield client.signAndBroadcast(address, updatedMessages, fee, data.memo || '');
            (0, stargate_1.assertIsDeliverTxSuccess)(result);
            return result.transactionHash;
        });
    }
}
exports.Cosmos = Cosmos;
