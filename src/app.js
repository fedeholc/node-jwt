//TODO: pendiente blacklist, expiracion, + remember me

//TODO: sanitizar los innerhtml

//TODO: la cookie del refresh la estoy mandando firmada? hace falta si ya está firmado el token?

//TODO: crear unit test y ver si también se puede hacer integracion con vitest y/o E2E con playwright

//TODO: convendría crear la BD (con algunos datos) en caso de que no exista??

//TODO: tema environment para testing, ver si tener otra base para eso y definirla en el endpoint.

//TODO: ver el tema port, que en algún lado está puesto que si no hay env use 3000, pero ojo porque ahora la auth de google lo tiene hardcodeado en la uri

//TODO: habría que probar implementarlo en alguna app para ver que funcione todo bien en producción

//TODO: eleccion de base de datos con .env

import { handleLogin } from "./routes/handle-login.js";

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
import { apiEP, dbURI } from "./endpoints.js";
import process from "process";
import { configServer } from "./server.js";
import { handleDeleteUser } from "./route-handlers/delete.js";
import { handleResetPass } from "./route-handlers/reset-pass.js";
import { handleChangePass } from "./route-handlers/change-pass.js";
import { db, secretKey } from "./global-store.js";
import { jwtVerify } from "jose";
import { genAccessToken } from "./util-auth.js";
import { handleLoginART } from "./routes/handle-login-ART.js";
import { handleRegisterART } from "./route-handlers/registerART.js";
import { handleUserInfoART } from "./route-handlers/user-infoART.js";
import {
  handleAuthGitHubART,
  handleAuthGitHubCallbackART,
} from "./route-handlers/auth-githubART.js";
import {
  handleAuthGoogleART,
  handleAuthGoogleCallbackART,
} from "./route-handlers/auth-googleART.js";

checkEnvVariables();

db.createTables();

const app = configServer();

//db.createTables();
//app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);
//app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);

app.get(apiEP.AUTH_GITHUB, handleAuthGitHubART);
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallbackART);

//app.get(apiEP.AUTH_GOOGLE, handleAuthGoogle);
//app.get(apiEP.AUTH_GOOGLE_CALLBACK, handleAuthGoogleCallback);

app.get(apiEP.AUTH_GOOGLE, handleAuthGoogleART);
app.get(apiEP.AUTH_GOOGLE_CALLBACK, handleAuthGoogleCallbackART);

//app.get(apiEP.USER_INFO, handleUserInfo);
app.get(apiEP.USER_INFO, handleUserInfoART);

//app.post(apiEP.LOGIN, handleLogin);
app.post(apiEP.LOGIN, handleLoginART);

app.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  console.log("hola desde refresh token");
  let a = await db.isDeniedToken(refreshToken);
  console.log("isDeniedToken:", a);

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token no proporcionado" });
  }

  // Verificar el refresh token
  try {
    let response = await jwtVerify(refreshToken, secretKey);
    console.log("response jwt verify: ", response);

    if (!response) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generar un nuevo access token
    const newAccessToken = await genAccessToken(
      {
        user: {
          id: response.payload.user.id,
          email: response.payload.user.email,
        },
      },
      secretKey
    );
    console.log("newAccessToken: ", newAccessToken);
    // Enviar el nuevo access token al cliente
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: `Invalid refresh token. ${error}` });
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
//app.post(apiEP.REGISTER, handleRegister);
app.post(apiEP.REGISTER, handleRegisterART);

// Ruta protegida (requiere token)
// Otra opción sería hacer la verificación trabajando con sesiones y pasando
// el usuario a través de la sesión (tiene sus ventajas y desventajas).
app.get(apiEP.PROFILE, extractToken, verifyToken(secretKey), (req, res) => {
  let user = db.getUserByEmail(req.payload.user.email);

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
  res
    .status(200)
    .send(
      "Hello World! user:" + req.session.user + " views:" + req.session.views
    );
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
