import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

export { generateToken, hashPassword };
/**
 *
 * @param {{}} payload - Information to be included in the token
 * @param {Uint8Array} secretKey - Secret key to sign the token
 * @returns string - token
 */
async function generateToken(payload, secretKey) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

/**
 *
 * @param {string} password
 * @returns string - hashed password
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
