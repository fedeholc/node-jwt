let secretKey = null;

export function getSecretKey() {
  if (!secretKey) {
    // eslint-disable-next-line no-undef
    const secretKeyArray = process.env.MY_SECRET_KEY.split(",").map(Number);

    secretKey = new Uint8Array(secretKeyArray);
    if (secretKey instanceof Uint8Array === false || secretKey.length !== 32) {
      console.error("Invalid secret key. Please check your .env file.");
      // eslint-disable-next-line no-undef
      process.exit(1);
    }
  }
  return secretKey;
}
