//TODO: crear unit test y ver si también se puede hacer E2E

//TODO: hay que poner bearer delante del token en el header de la request???

//TODO: cómo sería la lógica del lado del cliente con cookies?
// tengo que ver si hay un token en la cookie y si no lo hay, redirigir a la página de login? Si lo hay, lo considero ya como logueado y no muestro la página de login? o tengo que hacer una request al servidor para verificar que el token es válido? se hace a la página de loguin? o a una página de verificación de token? o directamente a la página que se quiere entrar(que sería la página de perfil)? o a una página de inicio que redirige a la página de perfil si el token es válido?

//todo: cuál sería un protocolo correcto para registro? mandar mail de verificación??
//ahora que tengo jwt, ver si con auth0 gratis puedo hacer algo de eso

// Servidor (Node.js con Express)
import express from "express";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { createDbConnection } from "./utils-db.js";

const db = createDbConnection("mydb.sqlite");
console.log(db);
/* 
db.all("SELECT * FROM user", [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
}); */

const app = express();

app.use(express.json());

//todo: debería guardar la key en un .env ? o está bien que se renueve cada vez que se reinicia el servidor?
const secretKey = new Uint8Array(crypto.randomBytes(32));

async function generarToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

// Función para hashear contraseñas
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Endpoint de login (sin token)
app.post("/login", async (req, res) => {
  const { username, password, email } = req.body;

  let userResponse = await getUserByEmail(email);
  console.log(userResponse, req.body);
  if (
    username === userResponse.user &&
    hashPassword(password) === userResponse.pass
  ) {
    const token = await generarToken({
      id: userResponse.id,
      email: userResponse.email,
    });

    res.status(201).json({ token: token });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
});

async function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM user WHERE email = ?", email, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
}

async function insertUser(username, email, password) {
  return new Promise(function (resolve, reject) {
    db.run(
      "INSERT INTO user (user, email, pass) VALUES (?, ?, ?)",
      [username, email, password],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

// Endpoint de registro
app.post("/registro", async (req, res) => {
  const { username, password, email } = req.body;

  // Validación básica
  if (!username || !password || !email) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  let userResponse = await getUserByEmail(email);

  if (userResponse) {
    return res.status(409).json({ error: "Usuario o email ya existe" });
  }

  // Crear nuevo usuario
  try {
    const id = await insertUser(username, email, hashPassword(password));

    const token = await generarToken({
      id: id,
      email: email,
    });

    return res.status(201).json({
      mensaje: "Usuario registrado con éxito. Id: " + id,
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al registrar usuario" + error });
  }
});

// Middleware para verificar token
async function verificarToken(req, res, next) {
  const token = req.headers["authorization"];
  console.log(req.headers);
  if (!token) return res.status(403).json({ error: "Token no proporcionado" });

  try {
    const { payload } = await jwtVerify(token, secretKey);
    req.usuario = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" + error });
  }
}

// Ruta protegida (requiere token)
app.get("/perfil", verificarToken, (req, res) => {
  let user = getUserByEmail(req.usuario.email);

  // dada la info que viene en el token esta validación
  // podría no ser necesaria.
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  } else {
    return res.status(201).json({
      mensaje: "Acceso permitido",
      usuario: user,
      usuarioToken: req.usuario,
    });
  }
});

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
