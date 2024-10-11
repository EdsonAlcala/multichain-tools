"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanonicalizedDerivationPath = void 0;
const canonicalize_1 = __importDefault(require("canonicalize"));
const lodash_pickby_1 = __importDefault(require("lodash.pickby"));
const getCanonicalizedDerivationPath = (derivationPath) => {
    var _a;
    return (_a = (0, canonicalize_1.default)((0, lodash_pickby_1.default)({
        chain: derivationPath.chain,
        domain: derivationPath.domain,
        meta: derivationPath.meta,
    }, (v) => v !== undefined && v !== null))) !== null && _a !== void 0 ? _a : '';
};
exports.getCanonicalizedDerivationPath = getCanonicalizedDerivationPath;
