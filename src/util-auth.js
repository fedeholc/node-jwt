export { genAccessToken, genRefreshToken, hashPassword };

import { SignJWT } from "jose";
import crypto from "crypto";
import { accessJWTExpiration, refreshJWTExpiration } from "./global-store.js";
// eslint-disable-next-line no-unused-vars
import * as types from "./types.js";

/**
 * Function to generate a token
 * @param {types.TokenPayload} payload - Information to be included in the token
 * @param {Uint8Array} accessSecretKey - Secret key to sign the token
 * @returns {Promise<string>} - token
 */
async function genAccessToken(payload, accessSecretKey) {
  const newAccessToken = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      payload.rememberMe
        ? accessJWTExpiration.remember
        : accessJWTExpiration.noRemember
    )
    .sign(accessSecretKey);
  return newAccessToken;
}

/**
 * Function to generate a token
 * @param {types.TokenPayload} payload - Information to be included in the token
 * @param {Uint8Array} refreshSecretKey - Secret key to sign the token
 * @returns string - token
 */
async function genRefreshToken(payload, refreshSecretKey) {
  const newRefreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      payload.rememberMe
        ? refreshJWTExpiration.remember
        : refreshJWTExpiration.noRemember
    )
    .sign(refreshSecretKey);
  return newRefreshToken;
}

/**
 * Function to hash the password
 * @param {string} password
 * @returns {string} - hashed password
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
