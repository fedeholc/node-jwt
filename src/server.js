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

  //TODO: agregar secret key para firmar cookies. tiene sentido si ya la session tiene una secret key? o es para las cookies que creo por fuera de la session?
  //? cómo las leo despues?
  //? las que van a ser leídas en javascript del lado del cliente no hay que firmarlas no? (o es solo para escritura lo de firmar?) y en ese caso, cómo elijo cuáles si y cuáles no?
  //* eso es con signed = true, y después se accede a req.signedcookies
  app.use(cookieParser());

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

  //TODO: ojo, en nuestro caso la session está guardandose en memoria, si crashea el server se pierden las sesiones. Una opción es guardaras en una base de datos (sirve también para cuando se trabaja con más de un server)
  //en el vid no usa session, lo hace a mano generando un session id
  app.use(
    session({
      secret: sessionKey, // Cambiar esto por una clave secreta
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" }, //cookies seguras en producción (para usar HTTPS)
    })
  );

  app.use(sessionCounter);

  return app;
}
