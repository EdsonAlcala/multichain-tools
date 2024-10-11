"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bitcoin = void 0;
const axios_1 = __importDefault(require("axios"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utils_1 = require("./utils");
const utils_2 = require("../../signature/utils");
class Bitcoin {
    constructor(config) {
        this.network = config.network;
        this.providerUrl = config.providerUrl;
        this.contract = config.contract;
        this.signer = config.signer;
    }
    static toBTC(satoshis) {
        return satoshis / 100000000;
    }
    static toSatoshi(btc) {
        return Math.round(btc * 100000000);
    }
    fetchBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield (0, utils_1.fetchBTCUTXOs)(this.providerUrl, address);
            return Bitcoin.toBTC(utxos.reduce((acc, utxo) => acc + utxo.value, 0)).toString();
        });
    }
    fetchTransaction(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${this.providerUrl}tx/${transactionId}`);
            const tx = new bitcoin.Transaction();
            tx.version = data.version;
            tx.locktime = data.locktime;
            data.vin.forEach((vin) => {
                const txHash = Buffer.from(vin.txid, 'hex').reverse();
                const { vout, sequence } = vin;
                const scriptSig = vin.scriptsig
                    ? Buffer.from(vin.scriptsig, 'hex')
                    : undefined;
                tx.addInput(txHash, vout, sequence, scriptSig);
            });
            data.vout.forEach((vout) => {
                const { value } = vout;
                const scriptPubKey = Buffer.from(vout.scriptpubkey, 'hex');
                tx.addOutput(scriptPubKey, value);
            });
            data.vin.forEach((vin, index) => {
                if (vin.witness && vin.witness.length > 0) {
                    const witness = vin.witness.map((w) => Buffer.from(w, 'hex'));
                    tx.setWitness(index, witness);
                }
            });
            return tx;
        });
    }
    static parseRSVSignature(signature) {
        const r = signature.r.padStart(64, '0');
        const s = signature.s.padStart(64, '0');
        const rawSignature = Buffer.from(r + s, 'hex');
        if (rawSignature.length !== 64) {
            throw new Error('Invalid signature length.');
        }
        return rawSignature;
    }
    sendTransaction(txHex, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const proxyUrl = (options === null || options === void 0 ? void 0 : options.proxy) ? 'https://corsproxy.io/?' : '';
                const response = yield axios_1.default.post(`${proxyUrl}${this.providerUrl}tx`, txHex);
                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(`Failed to broadcast transaction: ${response.data}`);
            }
            catch (error) {
                console.error(error);
                throw new Error(`Error broadcasting transaction`);
            }
        });
    }
    handleTransaction(data, nearAuthentication, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const { address, publicKey } = yield (0, utils_1.fetchDerivedBTCAddressAndPublicKey)({
                signerId: nearAuthentication.accountId,
                path,
                btcNetworkId: this.network,
                nearNetworkId: nearAuthentication.networkId,
                multichainContractId: this.contract,
            });
            const { inputs, outputs } = data.inputs && data.outputs
                ? data
                : yield (0, utils_1.fetchBTCFeeProperties)(this.providerUrl, address, [
                    {
                        address: data.to,
                        value: Bitcoin.toSatoshi(parseFloat(data.value)),
                    },
                ]);
            const psbt = new bitcoin.Psbt({
                network: (0, utils_1.parseBTCNetwork)(this.network),
            });
            // Since the sender address is always P2WPKH, we can assume all inputs are P2WPKH
            yield Promise.all(inputs.map((utxo) => __awaiter(this, void 0, void 0, function* () {
                const transaction = yield this.fetchTransaction(utxo.txid);
                const prevOut = transaction.outs[utxo.vout];
                const value = utxo.value;
                // Prepare the input as P2WPKH
                const inputOptions = {
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessUtxo: {
                        script: prevOut.script,
                        value,
                    },
                };
                psbt.addInput(inputOptions);
            })));
            outputs.forEach((out) => {
                if ('script' in out) {
                    psbt.addOutput({
                        script: out.script,
                        value: out.value,
                    });
                }
                else {
                    psbt.addOutput({
                        address: out.address || address,
                        value: out.value,
                    });
                }
            });
            const keyPair = {
                publicKey,
                sign: (hash) => __awaiter(this, void 0, void 0, function* () {
                    const mpcSignature = yield this.signer(hash);
                    return Bitcoin.parseRSVSignature((0, utils_2.toRSV)(mpcSignature));
                }),
            };
            // Sign inputs sequentially to avoid nonce issues
            for (let index = 0; index < inputs.length; index += 1) {
                yield psbt.signInputAsync(index, keyPair);
            }
            psbt.finalizeAllInputs();
            const txid = yield this.sendTransaction(psbt.extractTransaction().toHex(), {
                proxy: true,
            });
            if (txid) {
                return txid;
            }
            throw new Error('Failed to broadcast transaction');
        });
    }
}
exports.Bitcoin = Bitcoin;
