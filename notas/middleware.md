# funcionamiento del middleware verifyToken

Inicialmente tenía la función `verifyToken` en el archivo `server.js` que tiene los endpoints. De este modo:

```js
async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  console.log(req.headers);
  if (!token) return res.status(403).json({ error: "Token no proporcionado" });

  try {
    //const { payload } = await jwtVerify(token, secretKey);
    req.payload = await jwtVerify(token, secretKey);
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" + error });
  }
}
```

Y la llamaba desde con `app.get("/perfil", verifyToken, (req, res) => { ... })`.

Luego la pasé a otro archivo `util-auth.js`, pero de ese no tenía acceso a cual era la `secretKey` para verificar el token, y no se le pueden pasar más parámetros que `req`, `res` y `next`. Entonces, la solución fue pasar la `secretKey` como un parámetro a una función que devuelve la función que hace de middleware. Quedando así:

```js
function verifyToken(secretKey) {
  return async function (req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ error: "Token not found." });
    }
    try {
      //const { payload } = await jwtVerify(token, secretKey);
      req.payload = await jwtVerify(token, secretKey);
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid Token: " + error });
    }
  };
}
```

Y en el archivo `server.js` la llamada ahora quedó `app.get("/perfil", verifyToken(secretKey), (req, res) => { ... })`.
