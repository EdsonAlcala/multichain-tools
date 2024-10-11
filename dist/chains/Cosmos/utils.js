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
exports.fetchCosmosBalance = exports.fetchChainInfo = exports.fetchDerivedCosmosAddressAndPublicKey = void 0;
const encoding_1 = require("@cosmjs/encoding");
const crypto_1 = require("@cosmjs/crypto");
const bech32_1 = require("bech32");
const signature_1 = require("../../signature");
const kdf_1 = require("../../kdf/kdf");
const utils_1 = require("../../kdf/utils");
const chain_registry_1 = require("chain-registry");
const stargate_1 = require("@cosmjs/stargate");
function fetchDerivedCosmosAddressAndPublicKey({ signerId, path, nearNetworkId, multichainContractId, prefix, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const contractRootPublicKey = yield signature_1.ChainSignaturesContract.getPublicKey({
            networkId: nearNetworkId,
            contract: multichainContractId,
        });
        if (!contractRootPublicKey) {
            throw new Error('Failed to fetch root public key');
        }
        const derivedKeyHex = yield (0, kdf_1.generateCompressedPublicKey)(signerId, (0, utils_1.getCanonicalizedDerivationPath)(path), contractRootPublicKey);
        const publicKey = (0, encoding_1.fromHex)(derivedKeyHex);
        const address = pubkeyToAddress(publicKey, prefix);
        return { address, publicKey: Buffer.from(publicKey) };
    });
}
exports.fetchDerivedCosmosAddressAndPublicKey = fetchDerivedCosmosAddressAndPublicKey;
function pubkeyToAddress(pubkey, prefix) {
    const pubkeyRaw = pubkey.length === 33 ? pubkey : crypto_1.Secp256k1.compressPubkey(pubkey);
    const sha256Hash = (0, crypto_1.sha256)(pubkeyRaw);
    const ripemd160Hash = (0, crypto_1.ripemd160)(sha256Hash);
    const address = bech32_1.bech32.encode(prefix, bech32_1.bech32.toWords(ripemd160Hash));
    return address;
}
const fetchChainInfo = (chainId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const chainInfo = chain_registry_1.chains.find((chain) => chain.chain_id === chainId);
    if (!chainInfo) {
        throw new Error(`Chain info not found for chainId: ${chainId}`);
    }
    const { bech32_prefix: prefix, chain_id: expectedChainId } = chainInfo;
    const denom = (_c = (_b = (_a = chainInfo.staking) === null || _a === void 0 ? void 0 : _a.staking_tokens) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.denom;
    const rpcUrl = (_f = (_e = (_d = chainInfo.apis) === null || _d === void 0 ? void 0 : _d.rpc) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.address;
    const restUrl = (_j = (_h = (_g = chainInfo.apis) === null || _g === void 0 ? void 0 : _g.rest) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.address;
    const gasPrice = (_m = (_l = (_k = chainInfo.fees) === null || _k === void 0 ? void 0 : _k.fee_tokens) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.average_gas_price;
    if (!prefix ||
        !denom ||
        !rpcUrl ||
        !restUrl ||
        !expectedChainId ||
        gasPrice === undefined) {
        throw new Error(`Missing required chain information for ${chainInfo.chain_name}`);
    }
    return { prefix, denom, rpcUrl, restUrl, expectedChainId, gasPrice };
});
exports.fetchChainInfo = fetchChainInfo;
function fetchCosmosBalance(address, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { restUrl, denom } = yield (0, exports.fetchChainInfo)(chainId);
            const client = yield stargate_1.StargateClient.connect(restUrl);
            const balance = yield client.getBalance(address, denom);
            return balance.amount;
        }
        catch (error) {
            console.error('Failed to fetch Cosmos balance:', error);
            throw new Error('Failed to fetch Cosmos balance');
        }
    });
}
exports.fetchCosmosBalance = fetchCosmosBalance;
