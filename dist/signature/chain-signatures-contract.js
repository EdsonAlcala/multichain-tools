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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainSignaturesContract = void 0;
const accounts_1 = require("@near-js/accounts");
const transactions_1 = require("@near-js/transactions");
const utils_1 = require("./utils");
const bn_js_1 = __importDefault(require("bn.js"));
const ethers_1 = require("ethers");
const relayer_1 = require("../relayer");
const utils_2 = require("../kdf/utils");
exports.ChainSignaturesContract = {
    getContract: ({ account, contract, }) => {
        return new accounts_1.Contract(account, contract, {
            viewMethods: ['public_key', 'experimental_signature_deposit'],
            changeMethods: ['sign'],
            useLocalViewExecution: false,
        });
    },
    getPublicKey: ({ networkId, contract, }) => __awaiter(void 0, void 0, void 0, function* () {
        const nearAccount = yield (0, utils_1.getNearAccount)({ networkId });
        const chainSignaturesContract = exports.ChainSignaturesContract.getContract({
            account: nearAccount,
            contract,
        });
        return yield chainSignaturesContract.public_key();
    }),
    getCurrentFee: ({ networkId, contract, }) => __awaiter(void 0, void 0, void 0, function* () {
        const nearAccount = yield (0, utils_1.getNearAccount)({ networkId });
        const chainSignaturesContract = exports.ChainSignaturesContract.getContract({
            account: nearAccount,
            contract,
        });
        return new bn_js_1.default((yield chainSignaturesContract.experimental_signature_deposit()).toLocaleString('fullwide', { useGrouping: false }));
    }),
    sign: ({ hashedTx, path, nearAuthentication, contract, relayerUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const account = yield (0, utils_1.getNearAccount)({
            networkId: nearAuthentication.networkId,
            accountId: nearAuthentication.accountId,
            keypair: nearAuthentication.keypair,
        });
        const mpcPayload = {
            payload: Array.from(ethers_1.ethers.getBytes(hashedTx)),
            path: (0, utils_2.getCanonicalizedDerivationPath)(path),
            key_version: 0,
        };
        const deposit = (_b = (_a = nearAuthentication.deposit) !== null && _a !== void 0 ? _a : (yield exports.ChainSignaturesContract.getCurrentFee({
            networkId: nearAuthentication.networkId,
            contract,
        }))) !== null && _b !== void 0 ? _b : new bn_js_1.default(1);
        try {
            return relayerUrl
                ? yield signWithRelayer({
                    account,
                    contract,
                    signArgs: mpcPayload,
                    deposit,
                    relayerUrl,
                })
                : yield signDirect({
                    account,
                    contract,
                    signArgs: mpcPayload,
                    deposit,
                });
        }
        catch (e) {
            console.error(e);
            throw new Error('Signature error, please retry');
        }
    }),
};
const signDirect = ({ account, contract, signArgs, deposit, }) => __awaiter(void 0, void 0, void 0, function* () {
    const chainSignaturesContract = exports.ChainSignaturesContract.getContract({
        account,
        contract,
    });
    const signature = yield chainSignaturesContract.sign({
        args: { request: signArgs },
        gas: utils_1.NEAR_MAX_GAS,
        amount: deposit,
    });
    return signature;
});
const signWithRelayer = ({ account, contract, signArgs, deposit, relayerUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
    const functionCall = transactions_1.actionCreators.functionCall('sign', { request: signArgs }, BigInt(utils_1.NEAR_MAX_GAS.toString()), BigInt(deposit.toString()));
    const signedDelegate = yield account.signedDelegate({
        receiverId: contract,
        actions: [functionCall],
        blockHeightTtl: 60,
    });
    // Remove the cached access key to prevent nonce reuse
    delete account.accessKeyByPublicKeyCache[
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    signedDelegate.delegateAction.publicKey.toString()];
    // TODO: add support for creating the signed delegate using the mpc recovery service with an oidc_token
    const res = yield fetch(`${relayerUrl}/send_meta_tx_async`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify((0, relayer_1.parseSignedDelegateForRelayer)(signedDelegate)),
        headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const txHash = yield res.text();
    const txStatus = yield account.connection.provider.txStatus(txHash, account.accountId, 'FINAL');
    const signature = txStatus.receipts_outcome.reduce((acc, curr) => {
        if (acc) {
            return acc;
        }
        const { status } = curr.outcome;
        return ((typeof status === 'object' &&
            status.SuccessValue &&
            status.SuccessValue !== '' &&
            Buffer.from(status.SuccessValue, 'base64').toString('utf-8')) ||
            '');
    }, '');
    if (signature) {
        const parsedJSONSignature = JSON.parse(signature);
        return parsedJSONSignature.Ok;
    }
    throw new Error('Signature error, please retry');
});
