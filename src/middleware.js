export { extractToken, verifyAccessToken, sessionCounter };

import { jwtVerify } from "jose";

/**
 * Middleware to extract the token from the Authorization header
 * @param {{}} req
 * @param {{}} res
 * @param {Function} next
 */
function extractToken(req, res, next) {
  try {
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
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
}

/**
 * Middleware to verify the token
 * @param {string} accessSecretKey
 * @returns
 */
function verifyAccessToken(accessSecretKey) {
  return async function (req, res, next) {
    const token = req.token;
    if (!token) {
      return res.status(401).json({ error: "Token not found." });
    }
    try {
      let response = await jwtVerify(token, accessSecretKey);
      req.payload = response.payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: `Invalid Token: ${error}` }); //
    }
  };
}

function sessionCounter(req, res, next) {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  console.log(
    `Sesion id: ${req.session.id} - cantidad de requests: ${req.session.count}`
  );
  next();
}
