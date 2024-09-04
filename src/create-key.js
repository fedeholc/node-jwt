import crypto from "crypto";
const secretKey = new Uint8Array(crypto.randomBytes(32));
console.log("Secret key in Uint8Array format:", secretKey);
console.log("Secret key in string format (for the .env file):");
console.log("MY_SECRET_KEY=" + secretKey.toString());
