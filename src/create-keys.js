import crypto from "crypto";
const secretKey = new Uint8Array(crypto.randomBytes(32));
console.log("TOKEN");
console.log("Secret key in Uint8Array format:", secretKey);
console.log("Secret key in string format (for the .env file):");
console.log("MY_SECRET_KEY=" + secretKey.toString());

const sessionKey = crypto.randomBytes(32).toString("hex");
console.log("SESSION");
console.log("Session key in string format (for the .env file):");
console.log("MY_SESSION_KEY=" + sessionKey);
