import { apiURL } from "./endpoints-front.js";

let userData = null;

const dialogSignup = document.getElementById("dialog-signup");
const btnOpenDialog = document.getElementById("btn-signup-open");
const btnCloseDialog = document.getElementById("close-signup");

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

document.addEventListener("DOMContentLoaded", main);

function main() {
  setEventListeners();
  displayLoggedOutUI();
  loadUserData();
}

async function loadUserData() {
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
      displayLoggedInUI();
    }
  } catch (error) {
    console.error(error);
    divInfo.innerHTML = `
    <h2> Error connecting with server </h2>`;

    throw error; // Propagamos el error para que pueda ser manejado más arriba si es necesario
  }
}

async function handleLogin(event) {
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
    displayLoggedInUI();
  }
}

async function handleLoginGH(event) {
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
}

async function handleLogOut() {
  let response = await fetch(apiURL.LOGOUT, {
    method: "GET",
    credentials: "include",
  });
  console.log("Logout Response: ", response);
  if (response.ok) {
    //window.location.reload();
    displayLoggedOutUI();
    loadUserData();
  }
}

async function handleSignUp(event) {
  //TODO agregar validación de email y password
  //TODO checkeo de mail con resend?
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

    displayLoggedInUI();

    //TODO: que hacer una vez que un usuario se loguea o se registra?
    //? como template debería poner un par de opciones, como ir a la página principal o a su perfil, pero si es una spa tal vez es simplemente como un refresh, pero no real sino tipo react re-rendereando la página pero mostrando otras cosas porque ahora es con el usuario logueado, para lo cual tendria que tener como un objeto global con la info del usuario logueado.
  }
  dialogSignup.close();
}

async function handleDeleteUser(event) {
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
    displayLoggedOutUI();
    dialogDelete.close();
  }
}

function displayLoggedInUI() {
  btnLogout.style.display = "block";
  btnLoginGH.style.display = "none";
  btnOpenDelete.style.display = "block";
  formLogin.style.display = "none";
  btnOpenDialog.style.display = "none";
}

function displayLoggedOutUI() {
  btnLogout.style.display = "none";
  btnLoginGH.style.display = "block";
  btnOpenDelete.style.display = "none";
  formLogin.style.display = "flex";
  btnOpenDialog.style.display = "block";

  document.querySelector("#email").value = "";
  document.querySelector("#password").value = "";
  document.querySelector("#su-email").value = "";
  document.querySelector("#su-password").value = "";
  document.querySelector("#su-confirm-password").value = "";
  document.querySelector("#delete-password").value = "";
}

function setEventListeners() {
  btnLogout.addEventListener("click", handleLogOut);

  btnLoginGH.addEventListener("click", handleLoginGH);

  btnLogin.addEventListener("click", handleLogin);

  btnSignUp.addEventListener("click", handleSignUp);

  btnDelete.addEventListener("click", handleDeleteUser);

  btnOpenDialog.addEventListener("click", () => {
    dialogSignup.showModal();
  });

  btnCloseDialog.addEventListener("click", () => {
    dialogSignup.close();
  });

  btnOpenDelete.addEventListener("click", () => {
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
}
