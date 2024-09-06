/* eslint-disable no-undef */
let secretKey = null;

export function getSecretKey() {
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
