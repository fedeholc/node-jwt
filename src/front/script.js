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

let userData = null;

const dialogSignup = document.getElementById("dialog-signup");
const btnOpenDialog = document.getElementById("btn-signup-open");
const btnCloseDialog = document.getElementById("close-dialog");

const dialogDelete = document.getElementById("dialog-delete");
const btnOpenDelete = document.getElementById("btn-delete-open");
const btnCloseDelete = document.getElementById("close-delete");
const btnDelete = document.getElementById("btn-delete");

const btnLogout = document.getElementById("btn-logout");
const btnLoginGH = document.getElementById("btn-login-gh");

const btnLogin = document.getElementById("btn-login");
const btnSignUp = document.getElementById("btn-signup");
const divInfo = document.getElementById("info");

const formLogin = document.getElementById("login-form");

btnOpenDialog.addEventListener("click", () => {
  dialogSignup.showModal();
});

btnCloseDialog.addEventListener("click", () => {
  dialogSignup.close();
});

btnOpenDelete.addEventListener("click", () => {
  console.log("userData", userData);
  if (!userData) {
    alert("User not logged in.");
  } else {
    dialogDelete.showModal();
  }
});

btnCloseDelete.addEventListener("click", () => {
  dialogDelete.close();
});

window.addEventListener("click", (event) => {
  if (event.target === dialogSignup) {
    dialogSignup.close();
  }
  if (event.target === dialogDelete) {
    dialogDelete.close();
  }
});

displayLoggedOut();

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

    userData = data.user;

    //TODO: validar que estén los datos esperados

    divInfo.innerHTML = `
    <h2>Usuario autorizado.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>User: ${userData.email}</p>`;

    dialogDelete.querySelector("#delete-title").innerHTML +=
      "<br>" + userData.email;
    console.log(dialogDelete);

    btnLogout.style.display = "block";
    displayLoggedIn();
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
    userData = data.user;
    divInfo.innerHTML = `
    <h2>Sesión iniciada.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>User: ${data.user.id} - ${data.user.email}</p>`;
    displayLoggedIn();
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

    displayLoggedIn();

    //TODO: que hacer una vez que un usuario se loguea o se registra?
    //? como template debería poner un par de opciones, como ir a la página principal o a su perfil, pero si es una spa tal vez es simplemente como un refresh, pero no real sino tipo react re-rendereando la página pero mostrando otras cosas porque ahora es con el usuario logueado, para lo cual tendria que tener como un objeto global con la info del usuario logueado.
  }
  dialogSignup.close();
});

btnDelete.addEventListener("click", async (event) => {
  event.preventDefault();

  if (!userData) {
    alert("User not logged in.");
    return;
  }
  let email = userData.email;
  let password = document.querySelector("#delete-password").value;

  let response = await fetch(apiURL.DELETE_USER, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: password }),
  });
  console.log("Delete Response: ", response);

  if (!response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
      <h2>Error al eliminar usuario.</h2>
      <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
      <p>Error: ${data.error}</p>`;
    alert("Error deleting user: " + data.error);

    //TODO: mejor mostrar la info en el form y no en un alert
    //Todos los textos en ingles??
  }

  if (response.ok) {
    divInfo.innerHTML = `
      <h2>Usuario eliminado.</h2>
      <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
       `;
    //window.location.reload();
    //hideLogin();
    displayLoggedOut();
    dialogDelete.close();
  }
});

function displayLoggedIn() {
  btnLogout.style.display = "block";
  btnLoginGH.style.display = "none";
  btnOpenDelete.style.display = "block";
  formLogin.style.display = "none";
  btnOpenDialog.style.display = "none";
}

function displayLoggedOut() {
  btnLogout.style.display = "none";
  btnLoginGH.style.display = "block";
  btnOpenDelete.style.display = "none";
  formLogin.style.display = "flex";
  btnOpenDialog.style.display = "block";
}
