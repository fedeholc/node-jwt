import { jwtVerify } from "jose";
export { handleUserInfo };

import { secretKey } from "../global-store.js";

async function handleUserInfo(req, res) {
  try {
    console.log("Cookies: ", req.cookies);
    if (req.cookies && req.cookies.jwtToken) {
      try {
        let userJWT = await jwtVerify(req.cookies.jwtToken, secretKey);
        if (userJWT) {
          return res.status(200).json({ user: userJWT.payload.user });
        }
      } catch (error) {
        console.error("Invalid Token", error);
        return res.status(401).json({ error: "Invalid JWT token." });
      }
    }
    return res
      .status(401)
      .json({ error: "No cookies or no token. User not authenticated." });
  } catch (error) {
    console.error("Error in handleUserInfo", error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
