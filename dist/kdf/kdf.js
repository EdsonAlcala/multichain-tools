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
exports.generateCompressedPublicKey = exports.deriveChildPublicKey = exports.najPublicKeyStrToUncompressedHexPoint = void 0;
const elliptic_1 = require("elliptic");
const js_sha3_1 = require("js-sha3");
const serialize_1 = require("near-api-js/lib/utils/serialize");
function najPublicKeyStrToUncompressedHexPoint(najPublicKeyStr) {
    return `04${Buffer.from((0, serialize_1.base_decode)(najPublicKeyStr.split(':')[1])).toString('hex')}`;
}
exports.najPublicKeyStrToUncompressedHexPoint = najPublicKeyStrToUncompressedHexPoint;
function sha3Hash(str) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        return (0, js_sha3_1.sha3_256)(data);
    });
}
function deriveChildPublicKey(parentUncompressedPublicKeyHex, signerId, path = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const ec = new elliptic_1.ec('secp256k1');
        const scalar = yield sha3Hash(`near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`);
        const x = parentUncompressedPublicKeyHex.substring(2, 66);
        const y = parentUncompressedPublicKeyHex.substring(66);
        // Create a point object from X and Y coordinates
        const oldPublicKeyPoint = ec.curve.point(x, y);
        // Multiply the scalar by the generator point G
        const scalarTimesG = ec.g.mul(scalar);
        // Add the result to the old public key point
        const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);
        return `04${newPublicKeyPoint.getX().toString('hex').padStart(64, '0') +
            newPublicKeyPoint.getY().toString('hex').padStart(64, '0')}`;
    });
}
exports.deriveChildPublicKey = deriveChildPublicKey;
const generateCompressedPublicKey = (signerId, path, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const ec = new elliptic_1.ec('secp256k1');
    const uncompressedHexPoint = najPublicKeyStrToUncompressedHexPoint(publicKey);
    const derivedPublicKeyHex = yield deriveChildPublicKey(uncompressedHexPoint, signerId, path);
    const publicKeyBuffer = Buffer.from(derivedPublicKeyHex, 'hex');
    // Compress the public key
    const compressedPublicKey = ec
        .keyFromPublic(publicKeyBuffer)
        .getPublic()
        .encodeCompressed();
    // Return the compressed public key as a hex string
    return Buffer.from(compressedPublicKey).toString('hex');
});
exports.generateCompressedPublicKey = generateCompressedPublicKey;
