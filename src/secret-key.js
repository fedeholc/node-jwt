export { getSecretKey, getSessionKey };

import process from "process";

let secretKey = null;
let sessionKey = null;

function getSecretKey() {
  if (!secretKey) {
    if (!process.env.MY_SECRET_KEY) {
      console.error("Secret key not found. Please check your .env file.");
      process.exit(1);
    }
    const secretKeyArray = process.env.MY_SECRET_KEY.split(",").map(Number);

    secretKey = new Uint8Array(secretKeyArray);
    if (secretKey instanceof Uint8Array === false || secretKey.length !== 32) {
      console.error("Invalid secret key. Please check your .env file.");
      process.exit(1);
    }
  }
  return secretKey;
}

function getSessionKey() {
  if (!sessionKey) {
    if (!process.env.MY_SESSION_KEY) {
      console.error("Session key not found. Please check your .env file.");
      process.exit(1);
    }
    sessionKey = process.env.MY_SESSION_KEY;
    if (typeof sessionKey !== "string" || sessionKey.length !== 64) {
      console.error("Invalid session key. Please check your .env file.");
      process.exit(1);
    }
  }
  return sessionKey;
}
