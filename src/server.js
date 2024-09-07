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
import axios from "axios";

const db = await getDbInstance();
console.log("DB connected", db);
const app = express();
//app.use(express.json());

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const redirectURI = "http://127.0.0.1:3000/auth/github/callback";

app.use(
  session({
    secret: "your-secret-keyour-secret-keyyour-secret-keyyour-secret-keyy", // Cambia esto por una clave secreta
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Asegúrate de configurar secure: true en producción si usas HTTPS
  })
);

//app.use(passport.initialize());
/* app.use(passport.session());
 */

app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  //console.log("Session:", req.session);
  next();
});

app.get("/auth/github", (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=user:email`;
  console.log("githubAuthURL", githubAuthURL);
  res.redirect(githubAuthURL);
});

/* app.use("/auth/github", passport.authenticate("github"));
 */
/* app.use(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/", session: false }),
  (req, res) => {
    console.log("req.user", req.user);
    res.redirect("/");
  }
); */

app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  console.log("code", code);

  if (!code) {
    return res.status(400).send("No authorization code received");
  }

  try {
    // Intercambiar el código de autorización por un access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectURI,
      },
      {
        headers: {
          Accept: "application/json", // Recibe la respuesta en formato JSON
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).send("Error obtaining access token");
    }

    // Usa el token para obtener la información del usuario
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userResponse.data;
    console.log("User info:", user.Authorization);

    // Aquí deberías manejar la lógica para iniciar sesión y crear una sesión para el usuario.
    // Por ejemplo, puedes guardar el usuario en una sesión de Express.
    req.session.user = user;

    res.redirect("/profileX"); // Redirige al perfil o a cualquier ruta que desees
  } catch (error) {
    console.error("Error during authentication", error);
    res.status(500).send("Authentication failed");
  }
});

function ensureAuthenticated(req, res, next) {
  console.log(
    "ensureAuthenticated session id y req auth",
    req.session.id,
    req.Authorization
  );
  if (req.session.user) {
    console.log("ensure session user", req.session.user.id);
  } else {
    console.log("ensure session no user", req.session.user);
  }
  console.log("ensure user:", req.user);
  if (req.session.user) {
    return next(); // Usuario autenticado, continúa con la solicitud
  } else {
    console.log("User not authenticated");
    //TODO: ojo, si se redirecciona a /auth/github se reloguea
    res.redirect("/nolog"); // Redirige a la página de inicio de sesión si no está autenticado
    //
  }
}
app.get("/", (req, res) => {
  console.log(req.session.id);
  res.status(201).send("Hello World! user:" + req.session.user);
});

app.get("/profileX", ensureAuthenticated, (req, res) => {
  // La ruta está protegida, el usuario debe estar autenticado
  const user = req.session.user; // Obtén el usuario de la sesión
  res.status(201).send(`Hello, ${user.login}! Your email is ${user.email}.`); // Muestra el perfil del usuario
});

const secretKey = getSecretKey();

//VER dos formas de hacer lo mismo, solo que con el router se introduce un paso más de separación que es útil si el login tuviera mas rutas internas, pues serían todas manejadas por el router. Pero en nuestro caso hay una sola, no tiene sentido complejizarlo.
app.use("/login2", loginRouter);
app.post("/login", handleLogin(db, secretKey));

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error during logout");
    }
    res.clearCookie("connect.sid"); // Limpiar la cookie de sesión
    res.redirect("/"); // Redirige a la página de inicio
  });
});

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
