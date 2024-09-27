export { genAccessToken, genRefreshToken, hashPassword };

import { SignJWT } from "jose";
import crypto from "crypto";

/**
 * Function to generate a token
 * @param {{}} payload - Information to be included in the token
 * @param {Uint8Array} accessSecretKey - Secret key to sign the token
 * @returns string - token
 */

async function genAccessToken(payload, accessSecretKey) {
  let expirationTime = "1h";
  if (!payload.rememberMe) {
    expirationTime = "10m";
  }
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime) //TODO: ¿ponerlo como variable de config?
    .sign(accessSecretKey);
}

//TODO: quitar las secret keys y hacer que sean parte de un objeto global? (deberìa tener keys para acess y refresh)
async function genRefreshToken(payload, refreshSecretKey) {
  let expirationTime = "30d";
  if (!payload.rememberMe) {
    expirationTime = "1h";
  }
  let newRefreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(refreshSecretKey);

  return newRefreshToken;
}

/**
 * Function to hash the password
 * @param {string} password
 * @returns string - hashed password
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
