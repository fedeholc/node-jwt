import { jwtVerify } from "jose";
import { secretKey } from "../global-store.js";

//TODO: esta tendría que llamarse algo así como handleGetUser y solo validar el token para devolver al front.
//TODO: Por lo tanto no checkiar acá con la base de datos.
//TODO: el checkeo con la base de datos tendría que hacerse al generar el refresh token.
//TODO: ahora que lo pienso acá podría pasar también por el middleware de verificar el token y que me llegue en el req.
 
export async function handleGetUser(req, res) {
  try {
    let token = null;

    if (req.headers && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      try {
        let userJWT = await jwtVerify(token, secretKey);
        if (userJWT) {
          //TODO: traer data extra del usuario desde la BD?

          return res.status(200).json({ user: userJWT.payload.user });
        }
      } catch (error) {
        console.error("--Invalid Token--", error);
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
