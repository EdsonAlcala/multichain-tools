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
exports.getNearAccount = exports.toRSV = exports.NEAR_MAX_GAS = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const accounts_1 = require("@near-js/accounts");
const keystores_1 = require("@near-js/keystores");
const crypto_1 = require("@near-js/crypto");
exports.NEAR_MAX_GAS = new bn_js_1.default('300000000000000');
const toRSV = (signature) => {
    return {
        r: signature.big_r.affine_point.substring(2),
        s: signature.s.scalar,
        v: signature.recovery_id,
    };
};
exports.toRSV = toRSV;
const getNearAccount = ({ networkId, accountId = 'dontcare', keypair = crypto_1.KeyPair.fromRandom('ed25519'), }) => __awaiter(void 0, void 0, void 0, function* () {
    const keyStore = new keystores_1.InMemoryKeyStore();
    yield keyStore.setKey(networkId, accountId, keypair);
    const connection = accounts_1.Connection.fromConfig({
        networkId,
        provider: {
            type: 'JsonRpcProvider',
            args: {
                url: {
                    testnet: 'https://rpc.testnet.near.org',
                    mainnet: 'https://rpc.mainnet.near.org',
                }[networkId],
            },
        },
        signer: { type: 'InMemorySigner', keyStore },
    });
    return new accounts_1.Account(connection, accountId);
});
exports.getNearAccount = getNearAccount;
