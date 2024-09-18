// TODO: favicon

// TODO: Revisar los dialoga, que los mensajes se muestren ahí, que no haya alerts, etc.

// TODO: implementar fresh tokens. leer la conversacion con gpt, para ver el tema de cuando expira, cuando renovar, etc.

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
        `No user authenticated: ${response.status} ${response.statusText}`
      );
      displayLoggedOutUI();
      return;
    }

    if (response.ok) {
      let data = await response.json();
      if (!data.user) {
        console.log(`No user data. ${response.status} ${response.statusText}`);
        displayLoggedOutUI();
        return;
      }
      userData = data.user;
      userContent.innerHTML = `
      <p>Id: ${userData.id}</p>
      <p>Email: ${userData.email}</p>`;

      displayLoggedInUI();
      return;
    }
  } catch (error) {
    console.error(`Error loading user data: ${error}`);
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const divLoginInfo = document.getElementById("login-info");

  let inputEmail = document.querySelector("#email");
  let inputPassword = document.querySelector("#password");
  let email = inputEmail.value;
  let password = inputPassword.value;

  if (
    !inputEmail.validity.valid ||
    !inputPassword.validity.valid ||
    email === "" ||
    password === ""
  ) {
    divLoginInfo.innerHTML = `Enter a valid email and password.`;
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

  if (!response.ok) {
    divLoginInfo.innerHTML = `Your email or password is incorrect. Please try again.`;
    return;
  }

  if (response.ok) {
    let data = await response.json();
    userData = data.user;
    userContent.innerHTML = `
      <p>Id: ${userData.id}</p>
      <p>Email: ${userData.email}</p>`;
    displayLoggedInUI();
    return;
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
  if (!response.ok) {
    console.log(`Error logging out. ${response.status} ${response.statusText}`);
    return;
  }
  if (response.ok) {
    displayLoggedOutUI();
    loadUserData();
    return;
  }
}

async function handleSignUp(event) {
  event.preventDefault();
  let inputEmail = document.querySelector("#su-email");
  let email = document.querySelector("#su-email").value;
  let password = document.querySelector("#su-password").value;
  let confirmPassword = document.querySelector("#su-confirm-password").value;

  const signupInfo = document.querySelector("#signup-info");

  if (email === "" || password === "" || confirmPassword === "") {
    signupInfo.innerHTML = `
        Please fill in all fields.`;
    return;
  }

  if (password !== confirmPassword) {
    signupInfo.innerHTML = `
        Passwords don't match.`;
    return;
  }

  if (!inputEmail.validity.valid) {
    signupInfo.innerHTML = `
        Enter a valid email.`;
    return;
  }

  try {
    let response = await fetch(apiURL.REGISTER, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, pass: password }),
    });

    if (!response.ok) {
      let data = await response.json();
      signupInfo.innerHTML = `Error signing up user: ${data.error}`;
      console.log(
        `Error signing up. ${response.status} ${response.statusText}`
      );
    }

    if (response.ok) {
      let data = await response.json();

      if (!data.user) {
        signupInfo.innerHTML = `Error signing up user: ${data.error}`;
        console.log(
          `Error signing up. ${response.status} ${response.statusText}`
        );
        return;
      }

      userData = data.user;
      userContent.innerHTML = `
      <p>User successfully registered.</p>
      <p>Id: ${userData.id}</p>
      <p>Email: ${userData.email}</p>`;

      displayLoggedInUI();

      // Según el tipo de web, aquí puede cambiar la interfaz o puede
      // redirigir a otra página:
      // window.location.href = "/profile";
      dialogSignup.close();
    }
  } catch (error) {
    signupInfo.innerHTML = `Error signing up user: ${error}`;
    console.error("Error signing up: ", error);
  }
}

async function handleDeleteUser(event) {
  event.preventDefault();
  let deleteInfo = document.querySelector("#delete-info");
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

  if (!response.ok) {
    let data = await response.json();
    deleteInfo.innerHTML = `
      Error deleting user: ${data.error}`;
    return;
  }

  if (response.ok) {
    deleteInfo.innerHTML = `
      User successfully deleted.`;

    deleteInfo.style.color = "green";
    deleteInfo.style.fontWeight = "bold";

    userData = null;

    setTimeout(() => {
      dialogDelete.close();
      displayLoggedOutUI();
    }, 2000);
    //window.location.reload();
    //hideLogin();
  }
}

async function handleChangePass(event) {
  event.preventDefault();
  let changeInfo = document.querySelector("#change-info");

  let codeInput = document.querySelector("#reset-code");
  let passInput = document.querySelector("#reset-password");
  let confirmInput = document.querySelector("#reset-confirm-password");

  let code = document.querySelector("#reset-code").value;
  let pass = document.querySelector("#reset-password").value;
  let confirmPass = document.querySelector("#reset-confirm-password").value;
  let email = document.querySelector("#reset-email").value;

  try {
    if (!codeInput.validity.valid) {
      changeInfo.innerHTML = `
        Enter a code with six characters.`;
      return;
    }

    //TODO: validar tamaño pass?

    if (pass === "" || confirmPass === "" || email === "") {
      changeInfo.innerHTML = `
        Please fill in all fields.`;
      return;
    }

    if (pass !== confirmPass) {
      changeInfo.innerHTML = `
        Passwords don't match.`;
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
      console.log(
        "Error changing password: ",
        data.error,
        response.statusText,
        response.status
      );
      changeInfo.innerHTML = `
      Error changing password. ${data.error}`;
      return false;
    }

    if (response.ok) {
      changeInfo.style.color = "green";
      changeInfo.style.fontWeight = "bold";

      changeInfo.innerHTML = `
      Password successfully changed.`;

      //delay 2 seconds
      setTimeout(() => {
        dialogReset.close();
        return true;
      }, 2000);
    }
  } catch (error) {
    console.error("Error changing password: ", error);
    changeInfo.innerHTML = `
    Error changing password. Try again later.`;
  }
}

async function handleSendCode(e) {
  e.preventDefault();
  const codeInfo = document.querySelector("#code-info");

  try {
    let inputEmail = document.querySelector("#reset-email");
    let email = inputEmail.value;

    if (!inputEmail.validity.valid) {
      codeInfo.innerHTML = `
        Enter a valid email.`;

      return;
    }

    //TODO: ojo, corregir
    let response = await fetch(apiURL.RESET_PASS, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });
    console.log("Reset Response: ", response);

    //TODO: ver de los errores que mando en express cuales les puse data para mostrar.
    if (!response.ok) {
      let data = await response.json();
      codeInfo.innerHTML = `
      Error sending code. ${data.error}`;
      return false;
    }

    if (response.ok) {
      //TODO: mensaje ok code-info

      codeInfo.innerHTML = `
      The secuirity code was sent to your email. Check your inbox.`;
      codeInfo.style.color = "green";
      codeInfo.style.fontWeight = "bold";
    }
  } catch (error) {
    console.error("Error sending code: ", error);
    codeInfo.innerHTML = `
    Error sending code. Try again later.`;
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
      document.getElementById(
        "delete-user"
      ).innerHTML = `User: ${userData.email}`;

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
    if (event.target === dialogReset) {
      dialogReset.close();
    }
  });
}
