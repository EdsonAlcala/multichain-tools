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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVM = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const utils_2 = require("../../signature/utils");
class EVM {
    constructor(config) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config.providerUrl);
        this.contract = config.contract;
        this.signer = config.signer;
    }
    static prepareTransactionForSignature(transaction) {
        const serializedTransaction = ethers_1.ethers.Transaction.from(transaction).unsignedSerialized;
        const transactionHash = (0, ethers_1.keccak256)(serializedTransaction);
        return new Uint8Array(ethers_1.ethers.getBytes(transactionHash));
    }
    sendSignedTransaction(transaction, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serializedTransaction = ethers_1.ethers.Transaction.from(Object.assign(Object.assign({}, transaction), { signature })).serialized;
                return yield this.provider.broadcastTransaction(serializedTransaction);
            }
            catch (error) {
                console.error('Transaction execution failed:', error);
                throw new Error('Failed to send signed transaction.');
            }
        });
    }
    attachGasAndNonce(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasUserProvidedGas = transaction.gasLimit &&
                transaction.maxFeePerGas &&
                transaction.maxPriorityFeePerGas;
            const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } = hasUserProvidedGas
                ? transaction
                : yield (0, utils_1.fetchEVMFeeProperties)(this.provider._getConnection().url, transaction);
            const nonce = yield this.provider.getTransactionCount(transaction.from, 'latest');
            const { from } = transaction, rest = __rest(transaction, ["from"]);
            return Object.assign({ gasLimit,
                maxFeePerGas,
                maxPriorityFeePerGas, chainId: this.provider._network.chainId, nonce, type: 2 }, rest);
        });
    }
    getBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balance = yield this.provider.getBalance(address);
                return ethers_1.ethers.formatEther(balance);
            }
            catch (error) {
                console.error(`Failed to fetch balance for address ${address}:`, error);
                throw new Error('Failed to fetch balance.');
            }
        });
    }
    parseRSVSignature(rsvSignature) {
        const r = `0x${rsvSignature.r}`;
        const s = `0x${rsvSignature.s}`;
        const v = rsvSignature.v;
        return ethers_1.ethers.Signature.from({ r, s, v });
    }
    handleTransaction(data, nearAuthentication, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const derivedFrom = yield (0, utils_1.fetchDerivedEVMAddress)({
                signerId: nearAuthentication.accountId,
                path,
                nearNetworkId: nearAuthentication.networkId,
                multichainContractId: this.contract,
            });
            if (data.from && data.from.toLowerCase() !== derivedFrom.toLowerCase()) {
                throw new Error('Provided "from" address does not match the derived address');
            }
            const from = data.from || derivedFrom;
            const transaction = yield this.attachGasAndNonce(Object.assign(Object.assign({}, data), { from }));
            const txHash = EVM.prepareTransactionForSignature(transaction);
            const mpcSignature = yield this.signer(txHash);
            const transactionResponse = yield this.sendSignedTransaction(transaction, this.parseRSVSignature((0, utils_2.toRSV)(mpcSignature)));
            return transactionResponse;
        });
    }
}
exports.EVM = EVM;
