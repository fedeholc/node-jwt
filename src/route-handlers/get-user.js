import { jwtVerify } from "jose";
import { secretKey } from "../global-store.js";

//TODO: esta tendría que llamarse algo así como handleGetUser y solo validar el token para devolver al front.
//TODO: Por lo tanto no checkiar acá con la base de datos.
//TODO: el checkeo con la base de datos tendría que hacerse al generar el refresh token.
//TODO: ahora que lo pienso acá podría pasar también por el middleware de verificar el token y que me llegue en el req.

export async function handleGetUser(req, res) {
  if (req.payload) {
    return res.status(200).json({ user: req.payload.user });
  } else {
    return res.status(401).json({ error: "No token provided." });
  }
}
