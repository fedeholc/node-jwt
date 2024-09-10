import express from "express";
import { ALLOWED_ORIGINS } from "./endpoints.js";
import process from "process";
import { getSessionKey } from "./secret-key.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { sessionCounter } from "./middleware.js";

export function configServer() {
  const app = express();

  app.use(express.json()); //sirve para hacer que los datos que vienen en el body de la request sean parseados a JSON y se puedan acceder con req.body

  app.use(cookieParser());

  app.use(
    cors({
      origin: function (origin, callback) {
        console.log("origin", origin);
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

  app.use(
    session({
      secret: getSessionKey(), // Cambiar esto por una clave secreta
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" }, //cookies seguras en producción (para usar HTTPS)
    })
  );

  app.use(sessionCounter);

  return app;
}
