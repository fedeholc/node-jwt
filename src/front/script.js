import { apiURL } from "./endpoints-front.js";
import { cleanInputs, vibrate } from "./util.js";
import { auth } from "./auth.js";
// eslint-disable-next-line no-unused-vars
import * as types from "./types.js";

// - - - - - - - - - - - - - - - - - - -
// - Variables globales
// - - - - - - - - - - - - - - - - - - -

/** @type {types.UserPayload | null} */
let userData = null;

/** @type {string | null} */
let accessToken = null;

// - - - - - - - - - - - - - - - - - - -
// - Elementos del DOM
// - - - - - - - - - - - - - - - - - - -

const dialogSignup = /** @type {HTMLDialogElement} */ (
  document.getElementById("dialog-signup")
);
const btnOpenSignup = document.getElementById("btn-signup-open");
const btnCloseSignup = document.getElementById("close-signup");
const signupInfo = /** @type {HTMLDivElement} */ (
  document.querySelector("#signup-info")
);
const dialogDelete = /** @type {HTMLDialogElement} */ (
  document.getElementById("dialog-delete")
);
const btnOpenDelete = document.getElementById("btn-delete-open");
const btnCloseDelete = document.getElementById("close-delete");
const btnDelete = document.getElementById("btn-delete");
const deleteInfo = /** @type {HTMLDivElement} */ (
  document.querySelector("#delete-info")
);
const dialogReset = /** @type {HTMLDialogElement} */ (
  document.getElementById("dialog-reset")
);
const btnOpenReset = document.getElementById("btn-reset-open");
const btnCloseReset = document.getElementById("close-reset");
const btnChangePass = document.getElementById("btn-change-password");
const btnSendCode = document.getElementById("btn-send-code");
const codeInfo = /** @type {HTMLDivElement} */ (
  document.querySelector("#code-info")
);
const changeInfo = /** @type {HTMLDivElement} */ (
  document.querySelector("#change-info")
);

const btnLogout = document.getElementById("btn-logout");
const btnLoginGH = document.getElementById("btn-login-gh");
const btnLoginGG = document.getElementById("btn-login-gg");

const btnLogin = document.getElementById("btn-login");
const btnSignUp = document.getElementById("btn-signup");

const userInfoDisplay = document.getElementById("user-info-display");
const userInfoId = document.getElementById("user-info-id");
const userInfoEmail = document.getElementById("user-info-email");

//- - - - - - - - - - - - - - - - - - -
//- MAIN
//- - - - - - - - - - - - - - - - - - -

document.addEventListener("DOMContentLoaded", main);

async function main() {
  setEventListeners();
  accessToken = await auth.getAccessToken();
  userData = await getUserData(accessToken);
  renderUI();
}

//- - - - - - - - - - - - - - - - - - - - - - - -
//- Funciones: UI
//- - - - - - - - - - - - - - - - - - - - - - - -

function renderUI() {
  cleanInputs(document);
  if (userData) {
    //logged in UI
    userInfoId.textContent = `Id: ${userData.id}`;
    userInfoEmail.textContent = `Email: ${userData.email}`;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("user-section").style.display = "flex";
  } else {
    //logged out UI
    document.getElementById("login-section").style.display = "flex";
    document.getElementById("user-section").style.display = "none";
  }
}

//- - - - - - - - - - - - - - - - - - - - - - - -
//- Funciones: autenticación. - - - - - - - - - -
//- - - - - - - - - - - - - - - - - - - - - - - -

async function getUserData(accessToken) {
  try {
    if (!accessToken) {
      console.log("No token found.");
      return null;
    }

    let response = await fetch(apiURL.GET_USER, {
      method: "GET",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.log(
        `No user authenticated: ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (response.ok) {
      let data = await response.json();

      /** @type {types.UserPayload} */
      let user = data.user;
      if (!user) {
        console.log(`No user data. ${response.status} ${response.statusText}`);
        return null;
      }

      return user;
    }
  } catch (error) {
    console.error(`Error loading user data: ${error}`);
    return null;
  }
}

//- - - - - - - - - - - - - - - - - - - - - - - -
//- Funciones: handlers - - - - - - - - - - - - -
//- - - - - - - - - - - - - - - - - - - - - - - -

/**
 * @param {Event} event
 */
async function handleLogin(event) {
  event.preventDefault();

  const divLoginInfo = document.getElementById("login-info");

  /** @type {HTMLInputElement} */
  let inputEmail = document.querySelector("#email");

  /** @type {HTMLInputElement} */
  let inputPassword = document.querySelector("#password");

  /** @type {HTMLInputElement} */
  let inputRememberMe = document.querySelector("#remember-me");

  let email = inputEmail.value;
  let password = inputPassword.value;
  let rememberMe = inputRememberMe.checked;

  if (
    !inputEmail.validity.valid ||
    !inputPassword.validity.valid ||
    email === "" ||
    password === ""
  ) {
    divLoginInfo.textContent = `Enter a valid email and password.`;
    vibrate(divLoginInfo);
    vibrate(btnLogin);
    return;
  }

  let response = await fetch(apiURL.LOGIN, {
    method: "POST",
    credentials: "include", //para recibir la cookie también hay que ponerlo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      pass: password,
      rememberMe: rememberMe,
    }),
  });

  if (!response.ok) {
    divLoginInfo.textContent = `Your email or password is incorrect. Please try again.`;
    divLoginInfo.classList.add("vibrate");
    vibrate(divLoginInfo);
    vibrate(btnLogin);
    return;
  }

  if (response.ok) {
    let data = await response.json();
    userData = data.user;
    userInfoId.textContent = `Id: ${userData.id}`;
    userInfoEmail.textContent = `Email: ${userData.email}`;

    renderUI();

    localStorage.setItem("accessToken", JSON.stringify(data.accessToken));

    return;
  }
}

/**
 *
 * @param {Event} event
 */
async function handleLoginGH(event) {
  event.preventDefault();
  let returnTo = window.location.href;
  let response = await fetch(apiURL.AUTH_GITHUB + `?returnTo=${returnTo}`, {
    method: "GET",
    credentials: "include", //estás credentials sí son necesarias, para el envío de la cookie de session y el returnTo
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();

  window.location.href = data.ghauth;
}

/**
 *
 * @param {Event} event
 */
async function handleLoginGG(event) {
  event.preventDefault();
  let returnTo = window.location.href;
  let response = await fetch(apiURL.AUTH_GOOGLE + `?returnTo=${returnTo}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();

  window.location.href = data.gauth;
}

async function handleLogOut() {
  let response = await fetch(apiURL.LOGOUT, {
    method: "GET",
    credentials: "include", //acá también hacen falta manter las credentials para enviar la cookie de session
  });
  if (!response.ok) {
    console.log(`Error logging out. ${response.status} ${response.statusText}`);
    return;
  }
  if (response.ok) {
    localStorage.removeItem("accessToken");
    userData = null;
    renderUI();
    return;
  }
}

/**
 *
 * @param {Event} event
 */
async function handleSignUp(event) {
  event.preventDefault();

  /**@type {HTMLInputElement} */
  let inEmail = document.querySelector("#su-email");

  /**@type {HTMLInputElement} */
  let inPass = document.querySelector("#su-password");

  /**@type {HTMLInputElement} */
  let inConfirmPass = document.querySelector("#su-confirm-password");

  if (
    inEmail.value === "" ||
    inPass.value === "" ||
    inConfirmPass.value === ""
  ) {
    signupInfo.textContent = `Please fill in all fields.`;
    vibrate(signupInfo);
    vibrate(btnSignUp);
    return;
  }

  if (inPass.value !== inConfirmPass.value) {
    signupInfo.textContent = `Passwords don't match.`;
    vibrate(signupInfo);
    vibrate(btnSignUp);
    return;
  }

  if (!inEmail.validity.valid) {
    signupInfo.textContent = `Enter a valid email.`;
    vibrate(signupInfo);
    vibrate(btnSignUp);
    return;
  }

  try {
    let response = await fetch(apiURL.REGISTER, {
      method: "POST",
      credentials: "include", //para recibir el refresh token
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inEmail.value,
        pass: inPass.value,
      }),
    });

    if (!response.ok) {
      let data = await response.json();
      signupInfo.textContent = `Error signing up user: ${data.error}`;
      console.log(
        `Error signing up. ${response.status} ${response.statusText}`
      );
      vibrate(signupInfo);
      vibrate(btnSignUp);
      return;
    }

    if (response.ok) {
      let data = await response.json();

      if (!data.user) {
        signupInfo.textContent = `Error signing up user: ${data.error}`;
        console.log(
          `Error signing up. ${response.status} ${response.statusText}`
        );
        vibrate(signupInfo);
        vibrate(btnSignUp);
        return;
      }

      userData = data.user;
      userInfoDisplay.textContent = `User successfully registered.`;
      userInfoId.textContent = `Id: ${userData.id}`;
      userInfoEmail.textContent = `Email: ${userData.email}`;

      accessToken = data.accessToken;
      localStorage.setItem("accessToken", JSON.stringify(data.accessToken));

      renderUI();

      // Según el tipo de web, aquí puede cambiar la interfaz o puede
      // redirigir a otra página:
      // window.location.href = "/profile";
      dialogSignup.close();
    }
  } catch (error) {
    signupInfo.textContent = `Error signing up user: ${error}`;
    console.error("Error signing up: ", error);
    vibrate(signupInfo);
    vibrate(btnSignUp);
  }
}

/**
 *
 * @param {Event} event
 */
async function handleDeleteUser(event) {
  event.preventDefault();

  let email = userData.email;

  let inPass = /** @type {HTMLInputElement} */ (
    document.getElementById("#delete-password")
  );

  let response = await fetch(apiURL.DELETE_USER, {
    method: "DELETE",
    credentials: "include", //hay que mandar el refreshtoken para poder denegarlo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: inPass.value }),
  });

  if (!response.ok) {
    let data = await response.json();
    deleteInfo.textContent = `Error deleting user: ${data.error}`;
    vibrate(deleteInfo);
    vibrate(btnDelete);
    return;
  }

  if (response.ok) {
    deleteInfo.textContent = `User successfully deleted.`;
    deleteInfo.style.color = "green";
    deleteInfo.style.fontWeight = "bold";

    userData = null;
    localStorage.removeItem("accessToken");

    setTimeout(() => {
      dialogDelete.close();
      renderUI();
    }, 2000);
    //window.location.reload();
    //hideLogin();
  }
}

/**
 *
 * @param {Event} event
 * @returns
 */
async function handleChangePass(event) {
  event.preventDefault();

  let inCode = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-code")
  );

  let inPass = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-password")
  );
  let inConfirmPass = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-confirm-password")
  );
  let inEmail = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-email")
  );

  try {
    if (!inCode.validity.valid) {
      changeInfo.textContent = `Enter a code with six characters.`;
      vibrate(changeInfo);
      vibrate(btnChangePass);
      return;
    }

    if (
      inPass.value === "" ||
      inConfirmPass.value === "" ||
      inEmail.value === ""
    ) {
      changeInfo.textContent = `Please fill in all fields.`;
      vibrate(changeInfo);
      vibrate(btnChangePass);
      return;
    }

    if (inPass.value !== inConfirmPass.value) {
      changeInfo.textContent = `Passwords don't match.`;
      vibrate(changeInfo);
      vibrate(btnChangePass);
      return;
    }

    let response = await fetch(apiURL.CHANGE_PASS, {
      method: "POST",
      credentials: "include", //para que vaya la session cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inEmail.value,
        pass: inPass.value,
        code: inCode.value,
      }),
    });

    if (!response.ok) {
      let data = await response.json();
      changeInfo.textContent = `Error changing password. ${data.error}`;
      vibrate(changeInfo);
      vibrate(btnChangePass);
      return;
    }

    if (response.ok) {
      changeInfo.style.color = "green";
      changeInfo.style.fontWeight = "bold";

      changeInfo.textContent = `Password successfully changed.`;

      setTimeout(() => {
        dialogReset.close();
        return;
      }, 2000);
    }
  } catch (error) {
    console.error("Error changing password: ", error);
    changeInfo.textContent = `Error changing password. Try again later.`;
    vibrate(changeInfo);
    vibrate(btnChangePass);
  }
}

/**
 *
 * @param {Event} e
 * @returns
 */
async function handleSendCode(e) {
  e.preventDefault();

  try {
    let inEmail = /** @type {HTMLInputElement} */ (
      document.querySelector("#reset-email")
    );

    if (!inEmail.validity.valid) {
      codeInfo.textContent = `Enter a valid email.`;
      vibrate(codeInfo);
      vibrate(btnSendCode);
      return;
    }

    let response = await fetch(apiURL.RESET_PASS, {
      method: "POST",
      credentials: "include", //no quitar las credentials, porque se necesita enviar la cookie de session
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: inEmail.value }),
    });

    if (!response.ok) {
      let data = await response.json();
      codeInfo.textContent = `Error sending code. ${data.error}`;
      vibrate(codeInfo);
      vibrate(btnSendCode);
      return;
    }

    if (response.ok) {
      codeInfo.textContent = `The secuirity code was sent to your email. 
      Check your inbox.`;
      codeInfo.style.color = "green";
      codeInfo.style.fontWeight = "bold";
      vibrate(codeInfo);
      vibrate(btnSendCode);
      return;
    }
  } catch (error) {
    console.error("Error sending code: ", error);
    codeInfo.textContent = `Error sending code. Try again later.`;
    vibrate(codeInfo);
    vibrate(btnSendCode);
  }
}

//- - - - - - - - - - - - - - - - - - - - - - - -
//- Event listeners - - - - - - - - - - - - - - -
//- - - - - - - - - - - - - - - - - - - - - - - -

function setEventListeners() {
  btnLogout.addEventListener("click", handleLogOut);
  btnLoginGH.addEventListener("click", handleLoginGH);
  btnLoginGG.addEventListener("click", handleLoginGG);
  btnLogin.addEventListener("click", handleLogin);
  btnSignUp.addEventListener("click", handleSignUp);
  btnDelete.addEventListener("click", handleDeleteUser);
  btnSendCode.addEventListener("click", handleSendCode);
  btnChangePass.addEventListener("click", handleChangePass);

  btnOpenSignup.addEventListener("click", (e) => {
    e.preventDefault();
    dialogSignup.showModal();
  });

  btnCloseSignup.addEventListener("click", () => {
    dialogSignup.close();
    cleanInputs(dialogSignup);
    signupInfo.textContent = "";
  });

  btnOpenDelete.addEventListener("click", () => {
    if (!userData) {
      // Nunca debería entrar acá, no debería mostrarse el botón de delete account si no está logueado el usuario.
      alert("User not logged in.");
      renderUI();
      return;
    }

    document.getElementById(
      "delete-user"
    ).textContent = `User: ${userData.email}`;

    dialogDelete.showModal();
  });

  btnCloseDelete.addEventListener("click", () => {
    dialogDelete.close();
    cleanInputs(dialogDelete);
    deleteInfo.textContent = "";
  });

  btnOpenReset.addEventListener("click", async () => {
    dialogReset.showModal();
  });

  btnCloseReset.addEventListener("click", () => {
    dialogReset.close();
    cleanInputs(dialogReset);
    codeInfo.textContent = "";
    changeInfo.textContent = "";
  });

  window.addEventListener("click", (event) => {
    if (event.target === dialogSignup) {
      dialogSignup.close();
      cleanInputs(dialogSignup);
      signupInfo.textContent = "";
    }
    if (event.target === dialogDelete) {
      dialogDelete.close();
      cleanInputs(dialogDelete);
      deleteInfo.textContent = "";
    }
    if (event.target === dialogReset) {
      dialogReset.close();
      cleanInputs(dialogReset);
      codeInfo.textContent = "";
      changeInfo.textContent = "";
    }
  });
}
