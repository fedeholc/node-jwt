import { jwtVerify } from "jose";
export { handleUserInfo };

import { secretKey } from "../global-store.js";

async function handleUserInfo(req, res) {
  try {
    if (req.cookies && req.cookies.jwtToken) {
      let userJWT = await jwtVerify(req.cookies.jwtToken, secretKey);

      if (userJWT) {
        return res.status(200).json({ user: userJWT.payload.user });
      }
    }
    return res.status(401).json({ error: "No user authenticated" });
  } catch (error) {
    console.error("Error in handleUserInfo", error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
