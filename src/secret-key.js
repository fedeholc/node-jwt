export { getAccessSecretKey, getSessionKey, getRefreshSecretKey };

import process from "process";

let sessionKey = null;
let accessSecretKey = null;
let refreshSecretKey = null;

function getAccessSecretKey() {
  if (!accessSecretKey) {
    if (!process.env.ACCESS_SECRET_KEY) {
      console.error(
        "Access Secret key not found. Please check your .env file."
      );
      process.exit(1);
    }
    const secretKeyArray = process.env.ACCESS_SECRET_KEY.split(",").map(Number);

    accessSecretKey = new Uint8Array(secretKeyArray);
    if (
      accessSecretKey instanceof Uint8Array === false ||
      accessSecretKey.length !== 32
    ) {
      console.error("Invalid Access secret key. Please check your .env file.");
      process.exit(1);
    }
  }
  return accessSecretKey;
}

function getRefreshSecretKey() {
  if (!refreshSecretKey) {
    if (!process.env.REFRESH_SECRET_KEY) {
      console.error(
        "Refresh Secret key not found. Please check your .env file."
      );
      process.exit(1);
    }
    const secretKeyArray =
      process.env.REFRESH_SECRET_KEY.split(",").map(Number);

    refreshSecretKey = new Uint8Array(secretKeyArray);
    if (
      refreshSecretKey instanceof Uint8Array === false ||
      refreshSecretKey.length !== 32
    ) {
      console.error("Invalid Refresh secret key. Please check your .env file.");
      process.exit(1);
    }
  }
  return refreshSecretKey;
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
