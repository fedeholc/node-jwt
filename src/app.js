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
import { getUserByEmail, insertUser } from "./utils-db.js";
import {
  extractToken,
  generateToken,
  hashPassword,
  verifyToken,
} from "./util-auth.js";
import { getDbInstance } from "./db.js";
import { getSecretKey } from "./secret-key.js";
import cookieParser from "cookie-parser";
import { sessionCounter } from "./middleware.js";
import {
  handleAuthGitHub,
  handleAuthGitHubCallback,
} from "./route-handlers/auth-github.js";

const db = await getDbInstance();
console.log("DB connected", db);
const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir solicitudes sin origen (como las de herramientas de prueba)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Permite enviar cookies y credenciales
  })
);

app.use(
  session({
    secret: "your-secret-keyour-secret-keyyour-secret-keyyour-secret-keyy", // Cambiar esto por una clave secreta
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, //configurar secure: true en producción si se usa HTTPS
  })
);

app.use(sessionCounter);

app.get("/auth/github", handleAuthGitHub);
app.get("/auth/github/callback", handleAuthGitHubCallback);




app.get("/user-info", async (req, res) => {
  if (!req.cookies) {
    return res.status(401).json({ error: "nocookies" });
  }
  const accessToken = req.cookies.authToken;

  //TODO: qué pasa si hay otros providers? tengo que checkiar de quién es el token?

  if (!accessToken) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  //TODO: está parte está repetida en github callback, hacer función
  const userResponse = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("userResponse", userResponse);
  if (!userResponse.ok) {
    return res.status(400).send("Error obtaining user data");
  }

  //TODO: está bien traer la info de github? no debería traerla de mi bd?
  //VER o sea, el loguin sirve para evitar el pass, pero después de eso no debería depender del servidor de github, pero que info guardar en una cookie para dar acceso? uso JWT???

  const user = await userResponse.json();

  req.session.user = user;

  if (!req.session.user) {
    //VER debería hacer un logout y redirigir al login?
    return res.status(401).json({ error: "User not authenticated" });
  }

  res.status(200).json({ token: accessToken, user: req.session.user });
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

app.get("/nolog", (req, res) => {
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

app.get("/profileX", ensureAuthenticated, (req, res) => {
  // La ruta está protegida, el usuario debe estar autenticado
  const user = req.session.user; // Obtén el usuario de la sesión
  res
    .status(200)
    .send(
      `Hello ${req.session.views}, ${user.login}! Your email is ${user.email}.`
    ); // Muestra el perfil del usuario
});

const secretKey = getSecretKey();

//VER dos formas de hacer lo mismo, solo que con el router se introduce un paso más de separación que es útil si el login tuviera mas rutas internas, pues serían todas manejadas por el router. Pero en nuestro caso hay una sola, no tiene sentido complejizarlo.
app.use("/login2", loginRouter);
app.post("/login", handleLogin(db, secretKey));

app.get("/logout", (req, res) => {
  Object.keys(req.cookies).forEach((cookie) => {
    res.clearCookie(cookie);
  });
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error during logout");
    }
    //res.clearCookie("connect.sid"); // Limpiar la cookie de sesión

    res.status(201).send("ok"); // Redirige a la página de inicio
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
    return res.status(200).json({
      mensaje: "Access granted",
      usuario: user,
      usuarioToken: req.payload,
    });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
