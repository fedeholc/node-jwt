import express from "express";
import { ALLOWED_ORIGINS } from "./endpoints.js";
import process from "process";
import { getSessionKey } from "./secret-key.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { sessionCounter } from "./middleware.js";

const sessionKey = getSessionKey();

export function configServer() {
  const app = express();

  app.use(express.json()); //sirve para hacer que los datos que vienen en el body de la request sean parseados a JSON y se puedan acceder con req.body

  app.use(cookieParser()); //sirve para parsear las cookies que vienen en la request (en un solo string) y se pueden acceder con req.cookies

  app.use(
    cors({
      origin: function (origin, callback) {
        // Permitir solicitudes sin origen (por ejemplo, archivos locales)
        if (!origin) {
          return callback(null, true);
        }
        if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true, // Permite enviar cookies y credenciales
    })
  );

  //VER: en nuestro caso la session está guardandose en memoria, si crashea el server se pierden las sesiones. Una opción es guardaras en una base de datos (sirve también para cuando se trabaja con más de un server)
  //en el vid no usa session, lo hace a mano generando un session id
  //en nuestro caso solo estamos usando la session para guardar en req.session el returnTo de github auth
  //lo mismo que se hace con session se podría hacer con cookies a mano
  app.use(
    session({
      secret: sessionKey, // Cambiar esto por una clave secreta
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" }, //cookies seguras en producción (para usar HTTPS)
    })
  );

  //a modo de prueba, no cumple ninguna función
  app.use(sessionCounter);

  return app;
}
