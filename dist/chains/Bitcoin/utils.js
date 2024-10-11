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
exports.parseBTCNetwork = exports.fetchDerivedBTCAddressAndPublicKey = exports.fetchBTCFeeProperties = exports.fetchBTCUTXOs = exports.fetchBTCFeeRate = void 0;
const axios_1 = __importDefault(require("axios"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
// There is no types for coinselect
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const coinselect_1 = __importDefault(require("coinselect"));
const utils_1 = require("../../kdf/utils");
const kdf_1 = require("../../kdf/kdf");
const signature_1 = require("../../signature");
function fetchBTCFeeRate(providerUrl, confirmationTarget = 6) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(`${providerUrl}fee-estimates`);
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a[confirmationTarget]) {
            return response.data[confirmationTarget];
        }
        throw new Error(`Fee rate data for ${confirmationTarget} blocks confirmation target is missing in the response`);
    });
}
exports.fetchBTCFeeRate = fetchBTCFeeRate;
function fetchBTCUTXOs(providerUrl, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${providerUrl}address/${address}/utxo`);
            const utxos = response.data.map((utxo) => {
                return {
                    txid: utxo.txid,
                    vout: utxo.vout,
                    value: utxo.value,
                };
            });
            return utxos;
        }
        catch (error) {
            console.error('Failed to fetch UTXOs:', error);
            return [];
        }
    });
}
exports.fetchBTCUTXOs = fetchBTCUTXOs;
function fetchBTCFeeProperties(providerUrl, from, targets, confirmationTarget = 6) {
    return __awaiter(this, void 0, void 0, function* () {
        const utxos = yield fetchBTCUTXOs(providerUrl, from);
        const feeRate = yield fetchBTCFeeRate(providerUrl, confirmationTarget);
        // Add a small amount to the fee rate to ensure the transaction is confirmed
        const ret = (0, coinselect_1.default)(utxos, targets, Math.ceil(feeRate + 1));
        if (!ret.inputs || !ret.outputs) {
            throw new Error('Invalid transaction: coinselect failed to find a suitable set of inputs and outputs. This could be due to insufficient funds, or no inputs being available that meet the criteria.');
        }
        return ret;
    });
}
exports.fetchBTCFeeProperties = fetchBTCFeeProperties;
function fetchDerivedBTCAddressAndPublicKey({ signerId, path, btcNetworkId, nearNetworkId, multichainContractId, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const contractRootPublicKey = yield signature_1.ChainSignaturesContract.getPublicKey({
            networkId: nearNetworkId,
            contract: multichainContractId,
        });
        if (!contractRootPublicKey) {
            throw new Error('Failed to fetch root public key');
        }
        const derivedKey = yield (0, kdf_1.generateCompressedPublicKey)(signerId, (0, utils_1.getCanonicalizedDerivationPath)(path), contractRootPublicKey);
        const publicKeyBuffer = Buffer.from(derivedKey, 'hex');
        const network = parseBTCNetwork(btcNetworkId);
        // Use P2WPKH (Bech32) address type
        const payment = bitcoin.payments.p2wpkh({
            pubkey: publicKeyBuffer,
            network,
        });
        const { address } = payment;
        if (!address) {
            throw new Error('Failed to generate Bitcoin address');
        }
        return { address, publicKey: publicKeyBuffer };
    });
}
exports.fetchDerivedBTCAddressAndPublicKey = fetchDerivedBTCAddressAndPublicKey;
function parseBTCNetwork(network) {
    switch (network.toLowerCase()) {
        case 'mainnet':
            return bitcoin.networks.bitcoin;
        case 'testnet':
            return bitcoin.networks.testnet;
        case 'regtest':
            return bitcoin.networks.regtest;
        default:
            throw new Error(`Unknown Bitcoin network: ${network}`);
    }
}
exports.parseBTCNetwork = parseBTCNetwork;
