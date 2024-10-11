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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCosmosBalance = exports.fetchDerivedCosmosAddressAndPublicKey = exports.Cosmos = exports.fetchDerivedBTCAddressAndPublicKey = exports.fetchBTCFeeProperties = exports.Bitcoin = exports.fetchEVMFeeProperties = exports.fetchDerivedEVMAddress = exports.EVM = exports.ChainSignaturesContract = void 0;
var chain_signatures_contract_1 = require("./signature/chain-signatures-contract");
Object.defineProperty(exports, "ChainSignaturesContract", { enumerable: true, get: function () { return chain_signatures_contract_1.ChainSignaturesContract; } });
__exportStar(require("./signAndSendMethods"), exports);
// EVM
var EVM_1 = require("./chains/EVM/EVM");
Object.defineProperty(exports, "EVM", { enumerable: true, get: function () { return EVM_1.EVM; } });
var utils_1 = require("./chains/EVM/utils");
Object.defineProperty(exports, "fetchDerivedEVMAddress", { enumerable: true, get: function () { return utils_1.fetchDerivedEVMAddress; } });
Object.defineProperty(exports, "fetchEVMFeeProperties", { enumerable: true, get: function () { return utils_1.fetchEVMFeeProperties; } });
// Bitcoin
var Bitcoin_1 = require("./chains/Bitcoin/Bitcoin");
Object.defineProperty(exports, "Bitcoin", { enumerable: true, get: function () { return Bitcoin_1.Bitcoin; } });
var utils_2 = require("./chains/Bitcoin/utils");
Object.defineProperty(exports, "fetchBTCFeeProperties", { enumerable: true, get: function () { return utils_2.fetchBTCFeeProperties; } });
Object.defineProperty(exports, "fetchDerivedBTCAddressAndPublicKey", { enumerable: true, get: function () { return utils_2.fetchDerivedBTCAddressAndPublicKey; } });
// Cosmos
var Cosmos_1 = require("./chains/Cosmos/Cosmos");
Object.defineProperty(exports, "Cosmos", { enumerable: true, get: function () { return Cosmos_1.Cosmos; } });
var utils_3 = require("./chains/Cosmos/utils");
Object.defineProperty(exports, "fetchDerivedCosmosAddressAndPublicKey", { enumerable: true, get: function () { return utils_3.fetchDerivedCosmosAddressAndPublicKey; } });
Object.defineProperty(exports, "fetchCosmosBalance", { enumerable: true, get: function () { return utils_3.fetchCosmosBalance; } });
