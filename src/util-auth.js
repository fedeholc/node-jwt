export { extractToken, generateToken, hashPassword, verifyToken };

import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

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

/**
 *
 * @param {string} secretKey
 * @returns
 */
function verifyToken(secretKey) {
  return async function (req, res, next) {
    const token = req.token;
    console.log("token: ", token);
    if (!token) {
      return res.status(403).json({ error: "Token not found." });
    }
    try {
      //const { payload } = await jwtVerify(token, secretKey);
      req.payload = await jwtVerify(token, secretKey);
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid Token: " + error });
    }
  };
}

// Middleware para extraer el token
function extractToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    req.token = authHeader.split(" ")[1].trim();
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
