// TODO: favicon

// TODO: Revisar los dialoga, que los mensajes se muestren ahí, que no haya alerts, etc.

import { apiURL } from "./endpoints-front.js";

let userData = null;

const dialogSignup = document.getElementById("dialog-signup");
const btnOpenDialog = document.getElementById("btn-signup-open");
const btnCloseDialog = document.getElementById("close-signup");

const dialogDelete = document.getElementById("dialog-delete");
const btnOpenDelete = document.getElementById("btn-delete-open");
const btnCloseDelete = document.getElementById("close-delete");
const btnDelete = document.getElementById("btn-delete");

const dialogReset = document.getElementById("dialog-reset");
const btnOpenReset = document.getElementById("btn-reset-open");
const btnCloseReset = document.getElementById("close-reset");
const btnChangePass = document.getElementById("btn-change-password");
const btnSendCode = document.getElementById("btn-send-code");

const btnLogout = document.getElementById("btn-logout");
const btnLoginGH = document.getElementById("btn-login-gh");

const btnLogin = document.getElementById("btn-login");
const btnSignUp = document.getElementById("btn-signup");

const divInfo = document.getElementById("info");
const divLoginInfo = document.getElementById("login-info");
const userContent = document.getElementById("user-content");
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
      credentials: "include",
    });

    if (!response.ok) {
      console.log(
        `User not authenticated: ${response.status} ${response.statusText}`
      );
    }

    if (response.ok) {
      let data = await response.json();
      console.log(`User data:`, data);

      if (!data.user) {
        console.log(
          `User not authenticated: ${response.status} ${response.statusText}`
        );
      }
      userData = data.user;
      userContent.innerHTML = `
      <p>Id: ${userData.id}</p>
      <p>Email: ${userData.email}</p>`;

      dialogDelete.querySelector("#delete-title").innerHTML +=
        "<br>" + userData.email;
      console.log(dialogDelete);

      displayLoggedInUI();
    }
  } catch (error) {
    console.error(`Error loading user data: ${error}`);
  }
}

async function handleLogin(event) {
  //event.preventDefault();
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;

  if (email.validity.typeMismatch || password === "") {
    return;
  }

  let response = await fetch(apiURL.LOGIN, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: password }),
  });
  console.log("Login Response: ", response);

  //TODO: reestablecer luego si el usuario hace otra co
  if (!response.ok) {
    divLoginInfo.innerHTML = `Your email or password is incorrect. Please try again.`;
  }

  if (response.ok) {
    let data = await response.json();
    userData = data.user;
    userContent.innerHTML = `
      <p>Id: ${userData.id}</p>
      <p>Email: ${userData.email}</p>`;
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
  event.preventDefault();
  let email = document.querySelector("#su-email").value;
  let password = document.querySelector("#su-password").value;
  let confirmPassword = document.querySelector("#su-confirm-password").value;

  if (email === "" || password === "" || confirmPassword === "") {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords don't match.");
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

  if (!response.ok) {
    console.log(
      `Error signing up user: ${response.status} ${response.statusText}`
    );
  }

  if (response.ok) {
    let data = await response.json();
    userContent.innerHTML = `
      <p>User successfully registered.</p>
      <p>Id: ${userData.id}</p>
      <p>Email: ${userData.email}</p>`;

    userData = data.user;

    displayLoggedInUI();

    // Según el tipo de web, aquí puede cambiar la interfaz o puede
    // redirigir a otra página:
    // window.location.href = "/profile";
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
      <p>Server response: ${response.status} ${response.statusText}</p>
      <p>Error: ${data.error}</p>`;
    alert("Error deleting user: " + data.error);
  }

  if (response.ok) {
    divInfo.innerHTML = `
      <h2>Usuario eliminado.</h2>
      <p>Server response: ${response.status} ${response.statusText}</p>
       `;
    //window.location.reload();
    //hideLogin();
    displayLoggedOutUI();
    dialogDelete.close();
  }
}

async function handleChangePass(event) {
  event.preventDefault();
  let code = document.querySelector("#reset-code").value;
  let pass = document.querySelector("#reset-password").value;
  let confirmPass = document.querySelector("#reset-confirm-password").value;
  let email = document.querySelector("#reset-email").value;

  if (pass !== confirmPass) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  let response = await fetch(apiURL.CHANGE_PASS, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: pass, code: code }),
  });
  console.log("Change Password Response: ", response);

  if (!response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
      <h2>Error al cambiar contraseña.</h2>
      <p>Server response: ${response.status} ${response.statusText}</p>
      <p>Error: ${data.error}</p>`;
    alert("Error changing password: " + data.error);
    return false;
  }

  if (response.ok) {
    divInfo.innerHTML = `
      <h2>Contraseña cambiada.</h2>
      <p>Server response: ${response.status} ${response.statusText}</p>
       `;
    alert("Password changed.");
    dialogReset.close();
    return true;
  }
}

async function handleSendCode() {
  let email = document.querySelector("#reset-email").value;

  let response = await fetch(apiURL.RESET_PASS, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  });
  console.log("Reset Response: ", response);

  if (!response.ok) {
    let data = await response.json();
    divInfo.innerHTML = `
      <h2>Error al resetear contraseña.</h2>
      <p>Server response: ${response.status} ${response.statusText}</p>
      <p>Error: ${data.error}</p>`;
    alert("Error resetting password: " + data.error);
    return false;
  }

  if (response.ok) {
    divInfo.innerHTML = `
      <h2>Se envió código de seguridad al mail.</h2>
      <p>Server response: ${response.status} ${response.statusText}</p>
       `;
    alert("Security code sent to email. Check your inbox.");
    return true;
  }
}

function displayLoggedInUI() {
  /* 
  btnLogout.style.display = "block";
  btnLoginGH.style.display = "none";
  btnOpenDelete.style.display = "block";
  formLogin.style.display = "none";
  btnOpenDialog.style.display = "none";
 */
  document.getElementById("login-section").style.display = "none";
  document.getElementById("user-section").style.display = "flex";
}

function displayLoggedOutUI() {
  /*   btnLogout.style.display = "none";
  btnLoginGH.style.display = "block";
  btnOpenDelete.style.display = "none";
  formLogin.style.display = "flex";
  btnOpenDialog.style.display = "block"; */

  document.getElementById("login-section").style.display = "flex";
  document.getElementById("user-section").style.display = "none";

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

  btnOpenDialog.addEventListener("click", (e) => {
    document.querySelector("#email").removeAttribute("required");
    document.querySelector("#password").removeAttribute("required");
    e.preventDefault();
    dialogSignup.showModal();
  });

  btnCloseDialog.addEventListener("click", () => {
    dialogSignup.close();
    document.querySelector("#email").setAttribute("required", "");
    document.querySelector("#password").setAttribute("required", "");
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

  btnOpenReset.addEventListener("click", async () => {
    dialogReset.showModal();
  });

  btnCloseReset.addEventListener("click", () => {
    dialogReset.close();
  });

  btnSendCode.addEventListener("click", handleSendCode);
  btnChangePass.addEventListener("click", handleChangePass);

  window.addEventListener("click", (event) => {
    if (event.target === dialogSignup) {
      dialogSignup.close();
    }
    if (event.target === dialogDelete) {
      dialogDelete.close();
    }
  });
}
