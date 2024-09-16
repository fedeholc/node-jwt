//TODO: poner turso.

//TODO: revisar que try catchs estén bien y donde usar el throw error (revisar como hice en handle-login)

//TODO: textos y diseño

//TODO: crear unit test y ver si también se puede hacer integracion con vitest y/o E2E con playwright
 

import { handleLogin } from "./routes/handle-login.js";

import { getUserByEmail } from "./utils-db.js";
import { extractToken, verifyToken } from "./util-auth.js";
import { getDbInstance } from "./db.js";
import { getSecretKey } from "./secret-key.js";
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
import { handleDeleteUser } from "./route-handlers/delete.js";
import { handleResetPass } from "./route-handlers/reset-pass.js";
import { handleChangePass } from "./route-handlers/change-pass.js";

const secretKey = getSecretKey();
const db = await getDbInstance();

const app = configServer();

app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);

app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);

app.get(apiEP.USER_INFO, handleUserInfo);

app.post(apiEP.LOGIN, handleLogin);

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
