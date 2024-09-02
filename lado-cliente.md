```js
// Cliente (ejemplo usando fetch en el navegador)

// Función para hacer login (sin token)
async function login(username, password) {
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("token", data.token);
    return true;
  }
  return false;
}

// Función para acceder a ruta protegida (con token)
async function obtenerPerfil() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No hay token, debe hacer login primero");
    return;
  }

  const response = await fetch("http://localhost:3000/perfil", {
    headers: { Authorization: token },
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Perfil:", data);
  } else {
    console.log("Error al obtener el perfil");
  }
}

// Uso
login("usuario", "contraseña").then((success) => {
  if (success) {
    console.log("Login exitoso");
    obtenerPerfil();
  } else {
    console.log("Login fallido");
  }
});
```
