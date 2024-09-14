import { getSecretKey } from "../secret-key.js";
import { jwtVerify } from "jose";
export { handleUserInfo };

const secretKey = getSecretKey();

async function handleUserInfo(req, res) {
  if (req.cookies && req.cookies.jwtToken) {
    let userJWT = await jwtVerify(req.cookies.jwtToken, secretKey);

    if (userJWT) {
      return res.status(200).json({ user: userJWT.payload.user });
    }
  }
  return res.status(401).json({ error: "No user authenticated" });
}
