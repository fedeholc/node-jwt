export { extractToken, generateToken, hashPassword, verifyToken };

import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

/**
 * Function to generate a token
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
 * Function to hash the password
 * @param {string} password
 * @returns string - hashed password
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Middleware to verify the token
 * @param {string} secretKey
 * @returns
 */
function verifyToken(secretKey) {
  return async function (req, res, next) {
    const token = req.token;
    if (!token) {
      return res.status(403).json({ error: "Token not found." });
    }
    try {
      req.payload = await jwtVerify(token, secretKey);
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid Token: " + error });
    }
  };
}


/**
 * Middleware to extract the token from the Authorization header
 * @param {{}} req
 * @param {{}} res
 * @param {Function} next
 */
function extractToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    req.token = authHeader.split(" ")[1].trim();
    if (!req.token || req.token.trim() === "") {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}