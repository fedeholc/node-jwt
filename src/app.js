//TODO: ver handle user info
//TODO: pendiente blacklist en otros lugares aparte del logout, expiracion, + remember me
//TODO: probar caso en el que se general el access token junto con el referesh al loguearse, luego pasa un rato, se expira el access token, y se vuelve a usar el refresh para generar el access, ahi en ese caso antes de regenerar tiene que checkiar que ese refresh no esté en la blacklist, si está en la blacklist no se puede regenerar el access token y se tiene que loguear de nuevo

//VER respecto a la dnylist no me queda del todo claro cuando podrìa pasar que el token haya sido invalidado por ejemplo al logout pero que igual alguien lo pueda llegar a querer usar... revisar posibles casos.. el que SI se me ocurre es si el usuario se loguea desde varios dispositivos y quiere cerrar todas sus sessiones ahì si habrìa que ivalidar todos los refresh token del usuario
//TODO: pero para eso también tengo que tener una lista de tokens generados por usuario, no solo de los denegados.. o hay otra forma?

//TODO: sanitizar los innerhtml

//TODO: la cookie del refresh la estoy mandando firmada? hace falta si ya está firmado el token?

//TODO: crear unit test y ver si también se puede hacer integracion con vitest y/o E2E con playwright

//TODO: convendría crear la BD (con algunos datos) en caso de que no exista??

//TODO: tema environment para testing, ver si tener otra base para eso y definirla en el endpoint.

//TODO: ver el tema port, que en algún lado está puesto que si no hay env use 3000, pero ojo porque ahora la auth de google lo tiene hardcodeado en la uri

//TODO: habría que probar implementarlo en alguna app para ver que funcione todo bien en producción

//TODO: eleccion de base de datos con .env

import { extractToken, verifyToken } from "./util-auth.js";
import {
  handleAuthGitHub,
  handleAuthGitHubCallback,
} from "./route-handlers/auth-github.js";
import {
  handleAuthGoogle,
  handleAuthGoogleCallback,
} from "./route-handlers/auth-google.js";
import { handleUserInfo } from "./route-handlers/user-info.js";
import { handleLogOut } from "./route-handlers/logout.js";
import { handleRegister } from "./route-handlers/register.js";
import { handleGetUser } from "./route-handlers/get-user.js";
import { apiEP, dbURI } from "./endpoints.js";
import process from "process";
import { configServer } from "./server.js";
import { handleDeleteUser } from "./route-handlers/delete.js";
import { handleResetPass } from "./route-handlers/reset-pass.js";
import { handleChangePass } from "./route-handlers/change-pass.js";
import { db, secretKey } from "./global-store.js";
import { jwtVerify } from "jose";
import { genAccessToken } from "./util-auth.js";
import { handleLogin } from "./routes/handle-login.js";

checkEnvVariables();
db.createTables();

const app = configServer();

app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);
app.get(apiEP.AUTH_GOOGLE, handleAuthGoogle);
app.get(apiEP.AUTH_GOOGLE_CALLBACK, handleAuthGoogleCallback);

app.get(apiEP.USER_INFO, handleUserInfo);
app.get(apiEP.GET_USER, handleGetUser);
app.post(apiEP.LOGIN, handleLogin);

app.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  let isDenied = await db.isDeniedToken(refreshToken);
  if (isDenied) {
    return res.status(403).json({ error: "Refresh token denegado" });
  }

  if (!refreshToken) {
    return res.status(403).json({ error: "Refresh token no proporcionado" });
  }

  try {
    let response = await jwtVerify(refreshToken, secretKey);
    if (!response) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = await genAccessToken(
      {
        user: {
          id: response.payload.user.id,
          email: response.payload.user.email,
        },
      },
      secretKey
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ error: `Invalid refresh token. ${error}` });
  }
});

app.get(apiEP.LOGOUT, handleLogOut);

app.delete(apiEP.DELETE_USER, handleDeleteUser);

app.post(apiEP.RESET_PASS, handleResetPass);

app.post(apiEP.CHANGE_PASS, handleChangePass);

/**
 * Endpoint de registro, para hacerlo con usuario y password.
 * Si se registran con GitHub, el insert en la base de datos y el token, se
 * generan en handleAuthGitHubCallback.
 */

app.post(apiEP.REGISTER, handleRegister);

// Ruta protegida (requiere token)
// Otra opción sería hacer la verificación trabajando con sesiones y pasando
// el usuario a través de la sesión (tiene sus ventajas y desventajas).
app.get(apiEP.PROFILE, extractToken, verifyToken(secretKey), (req, res) => {
  //let user = db.getUserByEmail(req.payload.user.email);
  let user = req.payload.user;
  console.log("Profile user: ", user);
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

app.get(apiEP.ROOT, (req, res) => {
  console.log(req.session.id);
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  res.status(200).send("Hello World! views:" + req.session.views);
});

app.get("*", (req, res) => {
  res.status(404).send("¡Hola! Página no encontrada");
});
console.log("env", process.env.PORT);
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on port ${process.env.PORT || 3000}`)
);

function checkEnvVariables() {
  const requiredEnvVars = [
    "NODE_ENV",
    "MY_SECRET_KEY",
    "MY_SESSION_KEY",
    "DB_DEV_URI",
    "DB_TEST_URI",
    "DB_PROD_URI",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CLIENT_ID",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GMAIL_USER",
    "GMAIL_PASS",
    "PORT",
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Faltan las siguientes variables de entorno: ${missingEnvVars.join(", ")}`
    );
  }
}
