//TODO: crear unit test y ver si también se puede hacer integracion con vitest y/o E2E con playwright

//TODO: limpiar base de tokens expirados
// DELETE FROM blacklist WHERE expiration < strftime('%s','now') * 1000;

//TODO: convendría crear la BD (con algunos datos) en caso de que no exista??
//TODO: sí, y en particular para testing

//TODO: tema environment para testing, ver si tener otra base para eso y definirla en el endpoint.

//TODO: habría que probar implementarlo en alguna app para ver que funcione todo bien en producción

import { extractToken, verifyAccessToken } from "./middleware.js";
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
import { apiEP } from "./endpoints.js";
import process from "process";
import { configServer } from "./server.js";
import { handleDeleteUser } from "./route-handlers/delete.js";
import { handleResetPass } from "./route-handlers/reset-pass.js";
import { handleChangePass } from "./route-handlers/change-pass.js";
import { db, secretKey } from "./global-store.js";

import { handleLogin } from "./routes/handle-login.js";
import { handleRefreshToken } from "./route-handlers/refresh-token.js";

checkEnvVariables();
db.createTables();

const app = configServer();

app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);
app.get(apiEP.AUTH_GOOGLE, handleAuthGoogle);
app.get(apiEP.AUTH_GOOGLE_CALLBACK, handleAuthGoogleCallback);

app.get(apiEP.USER_INFO, handleUserInfo);
app.get(
  apiEP.GET_USER,
  extractToken,
  verifyAccessToken(secretKey),
  handleGetUser
);
app.post(apiEP.LOGIN, handleLogin);

app.post(apiEP.REFRESH, handleRefreshToken);

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
  res.status(404).send("¡Hola! 404 Página no encontrada");
});

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
