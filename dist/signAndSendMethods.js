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
exports.signAndSendCosmosTransaction = exports.signAndSendBTCTransaction = exports.signAndSendEVMTransaction = void 0;
const Bitcoin_1 = require("./chains/Bitcoin/Bitcoin");
const Cosmos_1 = require("./chains/Cosmos/Cosmos");
const EVM_1 = require("./chains/EVM/EVM");
const chain_signatures_contract_1 = require("./signature/chain-signatures-contract");
const signAndSendEVMTransaction = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const evm = new EVM_1.EVM(Object.assign(Object.assign({}, req.chainConfig), { signer: (txHash) => __awaiter(void 0, void 0, void 0, function* () {
                return yield chain_signatures_contract_1.ChainSignaturesContract.sign({
                    hashedTx: txHash,
                    path: req.derivationPath,
                    nearAuthentication: req.nearAuthentication,
                    contract: req.chainConfig.contract,
                    relayerUrl: req.fastAuthRelayerUrl,
                });
            }) }));
        const res = yield evm.handleTransaction(req.transaction, req.nearAuthentication, req.derivationPath);
        if (res) {
            return {
                transactionHash: res.hash,
                success: true,
            };
        }
        else {
            console.error(res);
            return {
                success: false,
                errorMessage: 'Transaction failed',
            };
        }
    }
    catch (e) {
        console.error(e);
        return {
            success: false,
            errorMessage: e instanceof Error ? e.message : String(e),
        };
    }
});
exports.signAndSendEVMTransaction = signAndSendEVMTransaction;
const signAndSendBTCTransaction = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const btc = new Bitcoin_1.Bitcoin(Object.assign(Object.assign({}, req.chainConfig), { signer: (txHash) => __awaiter(void 0, void 0, void 0, function* () {
                return yield chain_signatures_contract_1.ChainSignaturesContract.sign({
                    hashedTx: txHash,
                    path: req.derivationPath,
                    nearAuthentication: req.nearAuthentication,
                    contract: req.chainConfig.contract,
                    relayerUrl: req.fastAuthRelayerUrl,
                });
            }) }));
        const txid = yield btc.handleTransaction(req.transaction, req.nearAuthentication, req.derivationPath);
        return {
            transactionHash: txid,
            success: true,
        };
    }
    catch (e) {
        return {
            success: false,
            errorMessage: e instanceof Error ? e.message : String(e),
        };
    }
});
exports.signAndSendBTCTransaction = signAndSendBTCTransaction;
const signAndSendCosmosTransaction = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cosmos = new Cosmos_1.Cosmos({
            contract: req.chainConfig.contract,
            chainId: req.chainConfig.chainId,
            signer: (txHash) => __awaiter(void 0, void 0, void 0, function* () {
                return yield chain_signatures_contract_1.ChainSignaturesContract.sign({
                    hashedTx: txHash,
                    path: req.derivationPath,
                    nearAuthentication: req.nearAuthentication,
                    contract: req.chainConfig.contract,
                    relayerUrl: req.fastAuthRelayerUrl,
                });
            }),
        });
        const txHash = yield cosmos.handleTransaction(req.transaction, req.nearAuthentication, req.derivationPath);
        return {
            transactionHash: txHash,
            success: true,
        };
    }
    catch (e) {
        console.error(e);
        return {
            success: false,
            errorMessage: e instanceof Error ? e.message : String(e),
        };
    }
});
exports.signAndSendCosmosTransaction = signAndSendCosmosTransaction;
