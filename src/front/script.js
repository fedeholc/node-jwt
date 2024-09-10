//TODO: usuar id/uuid en lugar de mail para identificar usuario

/*
Inicio
- hay ¿token/info usuario?
  --> NO 
    --> state: no auth --> mostrar login (si es requerido, tal vez es la pagina principal y no requiere login para usar ciertas funcionalidades).
  --> SI 
    --> ¿hay conexion? 
      --> SI 
        --> ¿es valido el token/usuario?
          --> NO --> state: no auth --> logout, mostrar login
          --> SI --> state: auth --> mostrar info usuario
      --> NO
        --> state: offline --> mostrar info usuario (si es posible)

debería haber un evento para cuando se retoma la conexion, y si aun no está autorizado validar token

Lo que hay que decidir es segùn el tipo de aplicaciòn que funcionalidades estàn offline y cual sin usuario, eso podrìa alterar un poco ese flujo.
*/

//TODO: algo a resolver es, si tengo token, podría dar por logueado al usuario? como esta ahora no tengo mas info que el token, con lo cual estoy obligado a chekiar con mi base de datos cuales son los datos de ese usuario. Un modelo màs tipo local first implicaría tener los datos del usuario (còmo guardarlos sin comprometer la seguridad), y en ese caso si no hay conexion no importaria tanto, luego cuando se conecta se chekea si el usuario existe y se actualiza lo que haga falta.

import { apiURL } from "./endpoints-front.js";

const dialog = document.querySelector("dialog");
const btnOpenDialog = document.getElementById("btn-signup-open");
const btnCloseDialog = document.getElementById("close-dialog");
const btnLogout = document.getElementById("btn-logout");
const btnLoginGH = document.getElementById("btn-login-gh");
const btnLogin = document.getElementById("btn-login");
const btnSignUp = document.getElementById("btn-signup");
const divInfo = document.getElementById("info");

btnOpenDialog.addEventListener("click", () => {
  dialog.showModal();
});

btnCloseDialog.addEventListener("click", () => {
  dialog.close();
});

window.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

try {
  let response = await fetch(apiURL.USER_INFO, {
    method: "GET",
    credentials: "include", // Asegura que las cookies se envíen en la solicitud
  });

  console.log("Response: ", response);

  if (!response.ok) {
    divInfo.innerHTML = `
    <h2>No hay usuario autenticado.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>`;
  }

  if (response.ok) {
    let data = await response.json();
    console.log("Data:", data);

    //TODO: validar que estén los datos esperados

    divInfo.innerHTML = `
    <h2>Usuario autorizado.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>User: ${data.user.email}</p>`;

    btnLogout.style.display = "block";
    hideLogin();
  }
} catch (error) {
  console.error(error);
  divInfo.innerHTML = `
    <h2> Error connecting with server </h2>`;

  throw error; // Propagamos el error para que pueda ser manejado más arriba si es necesario
}

btnLogout.addEventListener("click", async () => {
  let response = await fetch(apiURL.LOGOUT, {
    method: "GET",
    credentials: "include",
  });
  console.log("Logout Response: ", response);
  if (response.ok) {
    window.location.reload();
  }
});

btnLoginGH.addEventListener("click", async (event) => {
  event.preventDefault();
  let response = await fetch(apiURL.AUTH_GITHUB, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();

  window.location.href = data.ghauth;
});

btnLogin.addEventListener("click", async (event) => {
  event.preventDefault();
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;

  let response = await fetch(apiURL.LOGIN, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: password }),
  });
  console.log("Login Response: ", response);

  if (!response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
    <h2>Error al iniciar sesión.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>Error: ${data.error}</p>`;
  }

  if (response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
    <h2>Sesión iniciada.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>User: ${data.user.id} - ${data.user.email}</p>`;
    hideLogin();
    //window.location.reload();
  }
});

//TODO agregar validación de email y password
//TODO checkeo de mail con resend?
btnSignUp.addEventListener("click", async (event) => {
  event.preventDefault();
  let email = document.querySelector("#su-email").value;
  let password = document.querySelector("#su-password").value;
  let confirmPassword = document.querySelector("#su-confirm-password").value;

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (email === "" || password === "" || confirmPassword === "") {
    alert("Please fill in all fields.");
    return;
  }

  let response = await fetch(apiURL.REGISTER, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: password }),
  });
  console.log("Signup Response: ", response);

  if (!response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
      <h2>Error al registrar usuario.</h2>
      <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
      <p>Error: ${data.error}</p>`;
  }

  if (response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
      <h2>Usuario registrado.</h2>
      <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
      <p>User: ${data.user.id} - ${data.user.email}</p>
      <p>Token: ${data.token}</p>`; //TODO: este token creo que debe venir
    //window.location.reload();

    hideLogin();

    //TODO: que hacer una vez que un usuario se loguea o se registra?
    //? como template debería poner un par de opciones, como ir a la página principal o a su perfil, pero si es una spa tal vez es simplemente como un refresh, pero no real sino tipo react re-rendereando la página pero mostrando otras cosas porque ahora es con el usuario logueado, para lo cual tendria que tener como un objeto global con la info del usuario logueado.
  }
  dialog.close();
});

function hideLogin() {
  btnLogout.style.display = "block";
  btnLoginGH.style.display = "none";
  document.querySelector("#login-form").style.display = "none";
  btnOpenDialog.style.display = "none";
}
