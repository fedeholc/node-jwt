import { jwtVerify } from "jose";
export { handleUserInfoART };

import { secretKey } from "../global-store.js";

async function handleUserInfoART(req, res) {
  try {
    console.log("req auth: ", req.headers.authorization);
    //TODO: revisar aca, salta al error si el token es invalido, y no llega al refresh.
    if (req.headers && req.headers.authorization) {
      try {
        let userJWT = await jwtVerify(
          req.headers.authorization.split(" ")[1],
          secretKey
        );
        console.log("userJWT: ", userJWT);
        if (userJWT) {
          //TODO: traer data extra del usuario desde la BD?
          //TODO: tal vez acá sí, pero tendría que tener una función y o endpoint solo para validar el token, tal vez uno como middleware
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
