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
exports.fetchDerivedEVMAddress = exports.fetchEVMFeeProperties = void 0;
const ethers_1 = require("ethers");
const signature_1 = require("../../signature");
const utils_1 = require("../../kdf/utils");
const kdf_1 = require("../../kdf/kdf");
function fetchEVMFeeProperties(providerUrl, transaction) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(providerUrl);
        const gasLimit = yield provider.estimateGas(transaction);
        const feeData = yield provider.getFeeData();
        const maxFeePerGas = (_a = feeData.maxFeePerGas) !== null && _a !== void 0 ? _a : ethers_1.ethers.parseUnits('10', 'gwei');
        const maxPriorityFeePerGas = (_b = feeData.maxPriorityFeePerGas) !== null && _b !== void 0 ? _b : ethers_1.ethers.parseUnits('10', 'gwei');
        return {
            gasLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
            maxFee: maxFeePerGas * gasLimit,
        };
    });
}
exports.fetchEVMFeeProperties = fetchEVMFeeProperties;
function fetchDerivedEVMAddress({ signerId, path, nearNetworkId, multichainContractId, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const contractRootPublicKey = yield signature_1.ChainSignaturesContract.getPublicKey({
            networkId: nearNetworkId,
            contract: multichainContractId,
        });
        if (!contractRootPublicKey) {
            throw new Error('Failed to fetch root public key');
        }
        const uncompressedHexPoint = (0, kdf_1.najPublicKeyStrToUncompressedHexPoint)(contractRootPublicKey);
        const childPublicKey = yield (0, kdf_1.deriveChildPublicKey)(uncompressedHexPoint, signerId, (0, utils_1.getCanonicalizedDerivationPath)(path));
        const publicKeyNoPrefix = childPublicKey.startsWith('04')
            ? childPublicKey.substring(2)
            : childPublicKey;
        const hash = ethers_1.ethers.keccak256(Buffer.from(publicKeyNoPrefix, 'hex'));
        return `0x${hash.substring(hash.length - 40)}`;
    });
}
exports.fetchDerivedEVMAddress = fetchDerivedEVMAddress;
