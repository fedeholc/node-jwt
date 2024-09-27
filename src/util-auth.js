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
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10s")
    .sign(accessSecretKey);
}

//TODO: quitar las secret keys y hacer que sean parte de un objeto global? (deberìa tener keys para acess y refresh)
async function genRefreshToken(payload, refreshSecretKey) {
  let newRefreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
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
