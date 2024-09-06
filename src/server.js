//TODO: crear unit test y ver si también se puede hacer E2E

//TODO: cómo sería la lógica del lado del cliente con cookies?
// tengo que ver si hay un token en la cookie y si no lo hay, redirigir a la página de login? Si lo hay, lo considero ya como logueado y no muestro la página de login? o tengo que hacer una request al servidor para verificar que el token es válido? se hace a la página de loguin? o a una página de verificación de token? o directamente a la página que se quiere entrar(que sería la página de perfil)? o a una página de inicio que redirige a la página de perfil si el token es válido?

//todo: cuál sería un protocolo correcto para registro? mandar mail de verificación??
//ahora que tengo jwt, ver si con auth0 gratis puedo hacer algo de eso

// Servidor (Node.js con Express)
import express from "express";
 import session from "express-session";
import passport from "./passport-config.js";
import { loginRouter } from "./routes/login-router.js";
import { handleLogin } from "./routes/handle-login.js";

import { getUserByEmail, insertUser } from "./utils-db.js";
import {
  extractToken,
  generateToken,
  hashPassword,
  verifyToken,
} from "./util-auth.js";
import { getDbInstance } from "./db.js";
import { getSecretKey } from "./secret-key.js";
 
const db = await getDbInstance();
console.log("DB connected", db);
const app = express();
//app.use(express.json());

app.use(session({
  secret: await getSecretKey(),
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.use(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

const secretKey = getSecretKey();

//VER dos formas de hacer lo mismo, solo que con el router se introduce un paso más de separación que es útil si el login tuviera mas rutas internas, pues serían todas manejadas por el router. Pero en nuestro caso hay una sola, no tiene sentido complejizarlo.
app.use("/login2", loginRouter);
app.post("/login", handleLogin(db, secretKey));

// Endpoint de registro
app.post("/register", async (req, res) => {
  const { user, pass, email } = req.body;

  if (!user || !pass || !email) {
    return res.status(400).json({ error: "All fields are required." });
  }

  let userResponse = await getUserByEmail(db, email);

  if (userResponse) {
    return res.status(409).json({ error: "User or email already exist." });
  }

  // Crear nuevo usuario
  try {
    const id = await insertUser(db, user, email, hashPassword(pass));

    const token = await generateToken(
      {
        id: id,
        user: user,
        email: email,
      },
      secretKey
    );

    return res.status(201).json({
      mensaje: "User succesfully registered. Id: " + id,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error registering user: " + error });
  }
});

// Middleware para verificar token

// Ruta protegida (requiere token)
app.get("/profile", extractToken, verifyToken(secretKey), (req, res) => {
  let user = getUserByEmail(db, req.payload.email);

  // dada la info que viene en el token esta validación
  // podría no ser necesaria.
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  } else {
    return res.status(201).json({
      mensaje: "Access granted",
      usuario: user,
      usuarioToken: req.payload,
    });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
