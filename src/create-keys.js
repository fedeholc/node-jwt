import crypto from "crypto";
 

const accessSecretKey = new Uint8Array(crypto.randomBytes(32));
console.log("ACCESS TOKEN");
console.log("Secret key in Uint8Array format:", accessSecretKey);
console.log("Secret key in string format (for the .env file):");
console.log("ACCESS_SECRET_KEY=" + accessSecretKey.toString());

const refreshSecretKey = new Uint8Array(crypto.randomBytes(32));
console.log("REFRESH TOKEN");
console.log("Secret key in Uint8Array format:", refreshSecretKey);
console.log("Secret key in string format (for the .env file):");
console.log("REFRESH_SECRET_KEY=" + refreshSecretKey.toString());

const sessionKey = crypto.randomBytes(32).toString("hex");
console.log("SESSION");
console.log("Session key in string format (for the .env file):");
console.log("MY_SESSION_KEY=" + sessionKey);
