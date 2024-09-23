Agregar un **refresh token** a una blacklist es necesario en varios casos, especialmente para proteger la seguridad del sistema y evitar el uso indebido de tokens robados o comprometidos. A continuación se detallan los casos más comunes en los que deberías agregar un refresh token a una blacklist:

### 1. **Cierre de sesión manual del usuario (Logout)**

- **Descripción**: Cuando un usuario cierra sesión de forma voluntaria (logout), el refresh token aún puede ser válido, pero debería invalidarse para evitar que pueda ser reutilizado.
- **Por qué es importante**: Si el refresh token no se invalida, alguien con acceso al token (por ejemplo, debido a una fuga o malware) podría utilizarlo para solicitar nuevos access tokens, incluso después de que el usuario haya cerrado sesión.

**Cuándo usar**: Cada vez que el usuario haga logout, el refresh token debe ser añadido a la blacklist.

### 2. **Rotación de Refresh Tokens**

- **Descripción**: Durante la rotación de refresh tokens (un enfoque de seguridad común), un refresh token antiguo se reemplaza por uno nuevo al solicitar un nuevo access token. El token antiguo debe ser agregado a la blacklist para evitar su reutilización.
- **Por qué es importante**: Si un refresh token antiguo no es revocado, podría ser reutilizado, lo que rompería el ciclo de rotación y podría generar problemas de seguridad.

**Cuándo usar**: Después de emitir un nuevo refresh token (rotación), el token anterior se debe agregar a la blacklist.

### 3. **Revocación por acciones de seguridad (cambio de contraseña, actualización de email, etc.)**

- **Descripción**: Si un usuario cambia su contraseña o realiza otras acciones de seguridad, como cambiar su correo electrónico o habilitar la autenticación de dos factores (2FA), cualquier refresh token antiguo debería ser invalidado para garantizar que solo los tokens nuevos se puedan utilizar.
- **Por qué es importante**: Un cambio en los detalles de seguridad debería invalidar cualquier acceso previo que haya podido ser comprometido.

**Cuándo usar**: Siempre que haya un cambio de contraseña, cambio de datos críticos de la cuenta o se detecte actividad sospechosa.

### 4. **Compromiso del token**

- **Descripción**: Si se sospecha o se detecta que un refresh token ha sido robado o comprometido (por ejemplo, por malware o brechas de seguridad), ese token debe ser revocado inmediatamente para que no pueda ser usado para obtener nuevos access tokens.
- **Por qué es importante**: Un refresh token comprometido puede dar acceso prolongado a un atacante, permitiéndole obtener nuevos access tokens incluso después de que el token de acceso actual haya expirado.

**Cuándo usar**: En cualquier situación en la que se sospeche que el token ha sido comprometido.

### 5. **Desactivación o eliminación de una cuenta de usuario**

- **Descripción**: Si un usuario decide eliminar su cuenta o si un administrador del sistema desactiva una cuenta por razones de seguridad o por inactividad, todos los refresh tokens asociados con ese usuario deben ser añadidos a la blacklist.
- **Por qué es importante**: Si un usuario ha eliminado su cuenta, no debería haber forma de que acceda nuevamente con tokens antiguos. También evita que alguien con un refresh token robado acceda a la cuenta eliminada.

**Cuándo usar**: Cuando una cuenta es eliminada o desactivada.

### 6. **Finalización de una sesión en dispositivos específicos**

- **Descripción**: En muchos sistemas, los usuarios pueden cerrar sesión desde dispositivos específicos. En estos casos, los refresh tokens asociados con esos dispositivos o sesiones deben invalidarse.
- **Por qué es importante**: Esto permite controlar el acceso a dispositivos que ya no están en uso, protegiendo la cuenta del usuario.

**Cuándo usar**: Cuando el usuario cierra sesión en un dispositivo o sesión específica desde un panel de control.

### 7. **Detectar actividad sospechosa o fraude**

- **Descripción**: Si se detecta actividad sospechosa, como un intento de login desde ubicaciones geográficas inusuales o con patrones de uso irregulares, se puede forzar la revocación de todos los refresh tokens emitidos.
- **Por qué es importante**: Esto previene accesos no autorizados continuos a la cuenta del usuario mediante el uso de refresh tokens robados.

**Cuándo usar**: Al detectar actividad sospechosa o que infringe las políticas de seguridad.

---

### **Implementación de la revocación de tokens en la blacklist**

Cada vez que una de estas situaciones ocurra, deberías agregar el refresh token correspondiente a la blacklist. En las implementaciones más robustas, podrías tener varias listas de control dependiendo del motivo de revocación, pero en la mayoría de los casos, una simple blacklist con tokens y su tiempo de expiración es suficiente.

En el caso de sistemas con múltiples dispositivos o sesiones, podrías también gestionar las listas de tokens por dispositivo o crear registros específicos para dispositivos activos, lo que te permite revocar tokens de manera granular.

### **Resumiendo**:

Agrega un **refresh token** a la blacklist en los siguientes casos:

1. Logout manual del usuario.
2. Rotación de refresh tokens.
3. Cambio de contraseña o medidas de seguridad.
4. Compromiso del token (sospecha o detección).
5. Desactivación o eliminación de cuenta.
6. Finalización de sesión en dispositivos específicos.
7. Detección de actividad sospechosa o fraude.

Esto asegura que los refresh tokens revocados no puedan ser usados para obtener nuevos access tokens y garantiza la seguridad del sistema.

---

Aquí tienes el ejemplo adaptado para usar **SQLite** en lugar de **Redis** para almacenar la **blacklist de refresh tokens**. En este caso, la blacklist será una tabla en la base de datos donde se almacenarán los tokens revocados junto con la fecha de su expiración.

### **Pasos para la implementación**

1. **Instalación de dependencias**:
   Primero, necesitas instalar las dependencias necesarias para Express, JWT, SQLite y el controlador de SQLite para Node.js.

```bash
npm install express jsonwebtoken sqlite3 body-parser
```

2. **Código de ejemplo**:

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");

// Inicializar express
const app = express();
app.use(bodyParser.json());

const ACCESS_TOKEN_SECRET = "secreto_access";
const REFRESH_TOKEN_SECRET = "secreto_refresh";

// Base de datos SQLite
const db = new sqlite3.Database(":memory:"); // Puedes usar un archivo como 'blacklist.db'

// Crear tabla para la blacklist de refresh tokens
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS blacklist (token TEXT PRIMARY KEY, expiration INTEGER)"
  );
});

// Promesas para queries en SQLite
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));

// Simulación de la base de datos de usuarios
const users = [{ id: 1, username: "user1", password: "password1" }];

// Función para añadir un token a la blacklist
const addToBlacklist = async (token, expiration) => {
  await dbRun("INSERT INTO blacklist (token, expiration) VALUES (?, ?)", [
    token,
    expiration,
  ]);
};

// Middleware para verificar si un refresh token está en la blacklist
const isBlacklisted = async (token) => {
  const result = await dbGet("SELECT token FROM blacklist WHERE token = ?", [
    token,
  ]);
  return result !== undefined;
};

// Generar tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};

// Endpoint para login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.sendStatus(401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({ accessToken, refreshToken });
});

// Endpoint para refrescar token
app.post("/token", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);

  // Verificar si el refresh token está en la blacklist
  const blacklisted = await isBlacklisted(token);

  if (blacklisted) return res.sendStatus(403); // Token bloqueado

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
    });
    res.json({ accessToken: newAccessToken });
  });
});

// Endpoint para cerrar sesión
app.post("/logout", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(400);

  // Decodificar el refresh token para obtener su fecha de expiración
  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    // Obtener la fecha de expiración del token en formato UNIX timestamp
    const expiration = decoded.exp * 1000; // JWT exp se da en segundos, se multiplica por 1000 para convertirlo en milisegundos
    addToBlacklist(token, expiration); // Agregar el token a la blacklist con su fecha de expiración
  });

  res.sendStatus(204);
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor iniciado en puerto 3000");
});
```

### **Explicación del código**:

1. **SQLite como base de datos**:

   - **SQLite** es inicializado en memoria (`:memory:`), pero podrías usar un archivo persistente como `'blacklist.db'` para que los datos se mantengan entre reinicios.
   - Creamos una tabla llamada `blacklist` con dos columnas: `token` y `expiration`. La columna `expiration` es para almacenar el tiempo de expiración del token (en formato UNIX timestamp).

2. **Función `addToBlacklist`**:

   - Esta función inserta el refresh token en la tabla `blacklist` junto con su tiempo de expiración.

3. **Función `isBlacklisted`**:

   - Se usa para consultar si un token ya está en la blacklist, devolviendo `true` si lo está y `false` en caso contrario.

4. **Manejo del token de refresco (`/token`)**:

   - Antes de emitir un nuevo token de acceso, se comprueba si el refresh token está en la blacklist usando la función `isBlacklisted`. Si está en la lista, se deniega la solicitud.

5. **Manejo del cierre de sesión (`/logout`)**:

   - Cuando el usuario cierra sesión, el refresh token es decodificado para obtener su tiempo de expiración y se agrega a la blacklist junto con su tiempo de expiración para evitar su reutilización.

6. **JWT**:
   - Los **access tokens** expiran en 15 minutos, mientras que los **refresh tokens** expiran en 1 día.

### **Mejoras adicionales**:

- **Limpiar tokens expirados**: Puedes añadir un proceso que periódicamente elimine de la base de datos los tokens de la blacklist que ya hayan expirado para mantener la tabla eficiente.

  Por ejemplo, podrías crear un script o cron job que ejecute:

  ```sql
  DELETE FROM blacklist WHERE expiration < strftime('%s','now') * 1000;
  ```

  Esto eliminaría todos los tokens cuya fecha de expiración ya pasó.

### Ventajas de usar SQLite:

- **Ligereza y portabilidad**: SQLite es extremadamente ligero y no requiere un servidor separado.
- **Persistencia**: Los tokens pueden persistir entre reinicios de la aplicación si usas un archivo de base de datos en lugar de la opción en memoria (`:memory:`).

### Alternativas:

- Usar otras bases de datos como PostgreSQL o MongoDB si tu aplicación escala o si ya estás usando un motor de base de datos específico.
