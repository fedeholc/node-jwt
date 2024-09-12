//TODO: crear unit test y ver si también se puede hacer E2E

//TODO: Probar si con session se reemplaza lo de mandar las cookies a mano.

//TODO: leer web.dev cookies

//TODO: ver donde poner los try catch si dentro y/o fuera de los métodos, y como menejar las respuestas del server, si throw error o no.

//todo: cuál sería un protocolo correcto para registro? mandar mail de verificación??
//ahora que tengo jwt, ver si con auth0 gratis puedo hacer algo de eso

import { loginRouter } from "./routes/login-router.js";
import { handleLogin } from "./routes/handle-login.js";
import { handleLogin2 } from "./routes/handle-login2.js";

import { getUserByEmail } from "./utils-db.js";
import { extractToken, verifyToken } from "./util-auth.js";
import { getDbInstance } from "./db.js";
import { getSecretKey } from "./secret-key.js";
import { ensureAuthenticated } from "./middleware.js";
import {
  handleAuthGitHub,
  handleAuthGitHubCallback,
} from "./route-handlers/auth-github.js";
import { handleUserInfo } from "./route-handlers/user-info.js";
import { handleLogOut } from "./route-handlers/logout.js";
import { handleRegister } from "./route-handlers/register.js";
import { apiEP } from "./endpoints.js";
import process from "process";
import { configServer } from "./server.js";

export const secretKey = getSecretKey();
export const db = await getDbInstance(); //TODO: le paso archivo?
console.log("DB connected", db);

const app = configServer();

app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);

//TODO: repensar esto de pasar la db y la secretkey que es para facilitar el testeo, pero no se si se esta usando una db y el token o si se esta mockeando todo igual. Revisar. Ver como sería sin pasarlos, teniendo un objeto global tal vez.
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback(db, secretKey));

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

//TODO: handleLogin2 era una prueba de loguin sin tener que pasar la db y la secretkey, en principio funciona, habrìa que modificar en los demas lugares.
//app.post(apiEP.LOGIN, handleLogin(db, secretKey));
app.post(apiEP.LOGIN, handleLogin2);

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
console.log("env", process.env.PORT);
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on port ${process.env.PORT || 3000}`)
);
