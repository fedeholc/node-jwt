//TODO: crear unit test y ver si también se puede hacer E2E

//TODO: Probar si con session se reemplaza lo de mandar las cookies a mano.

//TODO: leer web.dev cookies

//TODO: ver donde poner los try catch si dentro y/o fuera de los métodos, y como menejar las respuestas del server, si throw error o no.

//todo: cuál sería un protocolo correcto para registro? mandar mail de verificación??
//ahora que tengo jwt, ver si con auth0 gratis puedo hacer algo de eso

// Servidor (Node.js con Express)
import express from "express";
import session from "express-session";
import { loginRouter } from "./routes/login-router.js";
import { handleLogin } from "./routes/handle-login.js";
import cors from "cors";
import { getUserByEmail } from "./utils-db.js";
import { extractToken, verifyToken } from "./util-auth.js";
import { getDbInstance } from "./db.js";
import { getSecretKey, getSessionKey } from "./secret-key.js";
import cookieParser from "cookie-parser";
import { sessionCounter, ensureAuthenticated } from "./middleware.js";
import {
  handleAuthGitHub,
  handleAuthGitHubCallback,
} from "./route-handlers/auth-github.js";
import { handleUserInfo } from "./route-handlers/user-info.js";
import { handleLogOut } from "./route-handlers/logout.js";
import { handleRegister } from "./route-handlers/register.js";
import { ALLOWED_ORIGINS, apiEP } from "./endpoints.js";
import process from "process";

const secretKey = getSecretKey();
const db = await getDbInstance(); //TODO: le paso archivo?
console.log("DB connected", db);
const app = express();
app.use(express.json());
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

app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);

app.get(apiEP.USER_INFO, handleUserInfo);

app.get(apiEP.ROOT, (req, res) => {
  console.log(req.session.id);
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  res
    .status(200)
    .send(
      "Hello World! user:" + req.session.user + " views:" + req.session.views
    );
});

//VER dos formas de hacer lo mismo, solo que con el router se introduce un paso más de separación que es útil si el login tuviera mas rutas internas, pues serían todas manejadas por el router. Pero en nuestro caso hay una sola, no tiene sentido complejizarlo.
app.use(apiEP.LOGIN_2, loginRouter);
app.post(apiEP.LOGIN, handleLogin(db, secretKey));

app.get(apiEP.LOGOUT, handleLogOut);

// Endpoint de registro
// TODO: distintos endpoints según el tipo de registro?
// TODO: y cómo se haría la parte de verificación de mail?
app.post(apiEP.REGISTER, handleRegister(db, secretKey));

app.get(apiEP.PROFILE_X, ensureAuthenticated, (req, res) => {
  // La ruta está protegida, el usuario debe estar autenticado
  const user = req.session.user; // Obtén el usuario de la sesión
  res
    .status(200)
    .send(
      `Hello ${req.session.views}, ${user.login}! Your email is ${user.email}.`
    ); // Muestra el perfil del usuario
});

// Ruta protegida (requiere token)
app.get(apiEP.PROFILE, extractToken, verifyToken(secretKey), (req, res) => {
  let user = getUserByEmail(db, req.payload.user.email);

  // dada la info que viene en el token esta validación
  // podría no ser necesaria.
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  } else {
    return res.status(200).json({
      mensaje: "Access granted",
      usuario: user,
      usuarioToken: req.payload,
    });
  }
});

app.get("*", (req, res) => {
  res.status(404).send("¡Hola! Página no encontrada");
});

app.listen(3000, () => console.log("Server running on port 3000"));
