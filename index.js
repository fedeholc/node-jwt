// Servidor (Node.js con Express)
import express from "express";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { createDbConnection } from "./utils-db.js";

const db = createDbConnection("mydb.sqlite");
console.log(db);

db.all("SELECT * FROM user", [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

const app = express();

app.use(express.json());

const secretKey = new Uint8Array(crypto.randomBytes(32));

async function generarToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

//* cuando tenga usuario se puede generar el token con un payload con mas info que va a ir y volver
/*
// Generar token
async function generarToken(usuario) {
  const token = await new SignJWT({
    sub: usuario.id,
    username: usuario.username,
    role: usuario.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);
  
  return token;
}*/

// Función para hashear contraseñas
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Endpoint de login (sin token)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //* al usuario habría que buscarlo en una base de datos
  /*    const usuario = usuarios.find(
      (u) => u.username === username && u.password === hashPassword(password)
    ); */

  // Aquí iría la lógica de verificación de credenciales
  if (username === "usuario" && password === "contraseña") {
    const token = await generarToken({ id: 1, username });

    //* token con data del usuario
    /*       const token = await generarToken({
          id: usuario.id,
          username: usuario.username,
        }); */

    res.json({ token });
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

  let r = await getUserByEmail(email);

  if (r) {
    return res.status(409).json({ error: "Usuario o email ya existe" });
  }

  console.log("fuera", r);

  //* Crear nuevo usuario
  try {
    const id = await insertUser(username, email, hashPassword(password));
    console.log("id", id);

    const token = await generarToken({
      id: id,
      email: email,
    });

    //TODO Por aca está tirando un error a pesar de que registra el user
    // revisar
    return res
      .status(201)
      .json({ mensaje: "Usuario registrado con éxito. Id: " + id }, token);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al registrar usuario" + error });
  }
});

// Middleware para verificar token
async function verificarToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token no proporcionado" });

  try {
    const { payload } = await jwtVerify(token, secretKey);
    req.usuario = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Ruta protegida (requiere token)
app.get("/perfil", verificarToken, (req, res) => {
  res.json({ mensaje: "Acceso permitido", usuario: req.usuario });
});

//* también podría ser algo así:
/* 
app.get('/perfil', verificarToken, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.usuario.id);
  if (usuario) {
    const { password, ...usuarioSinPassword } = usuario;
    res.json({ mensaje: 'Acceso permitido', usuario: usuarioSinPassword });
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});
*/

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
