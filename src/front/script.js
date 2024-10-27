import { apiURL } from "./endpoints-front.js";
import { cleanInputs, vibrate } from "./util.js";
import { auth, getUserData } from "./auth.js";
import getDomElementsRefs from "./domElements.js";
// eslint-disable-next-line no-unused-vars
import * as types from "./types.js";

// - - - - - - - - - - - - - - - - - - -
// - Variables globales
// - - - - - - - - - - - - - - - - - - -

/** @type {types.UserPayload | null} */
let userData = null;

/** @type {string | null} */
let accessToken = null;

const DE = getDomElementsRefs(document);

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
    DE.user.id.textContent = `Id: ${userData.id}`;
    DE.user.email.textContent = `Email: ${userData.email}`;
    DE.login.section.style.display = "none";
    DE.user.section.style.display = "flex";
  } else {
    //logged out UI
    DE.user.id.textContent = `Id: -`;
    DE.user.email.textContent = `Email: -`;
    DE.login.section.style.display = "flex";
    DE.user.section.style.display = "none";
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

  /** @type {HTMLInputElement} */
  let inputEmail = document.querySelector("#email");

  /** @type {HTMLInputElement} */
  let inputPassword = document.querySelector("#password");

  /** @type {HTMLInputElement} */
  let inputRememberMe = document.querySelector("#remember-me");

  if (
    !inputEmail.validity.valid ||
    !inputPassword.validity.valid ||
    inputEmail.value === "" ||
    inputPassword.value === ""
  ) {
    DE.login.info.textContent = `Enter a valid email and password.`;
    vibrate(DE.login.info);
    vibrate(DE.login.passButton);
    return;
  }

  let response = await fetch(apiURL.LOGIN, {
    method: "POST",
    credentials: "include", //para recibir la cookie también hay que ponerlo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: inputEmail.value,
      pass: inputPassword.value,
      rememberMe: inputRememberMe.checked,
    }),
  });

  if (!response.ok) {
    DE.login.info.textContent = `Your email or password is incorrect. Please try again.`;
    DE.login.info.classList.add("vibrate");
    vibrate(DE.login.info);
    vibrate(DE.login.passButton);
    return;
  }

  if (response.ok) {
    let data = await response.json();
    userData = data.user;

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
    DE.signup.info.textContent = `Please fill in all fields.`;
    vibrate(DE.signup.info);
    vibrate(DE.signup.submitButton);
    return;
  }

  if (inPass.value !== inConfirmPass.value) {
    DE.signup.info.textContent = `Passwords don't match.`;
    vibrate(DE.signup.info);
    vibrate(DE.signup.submitButton);
    return;
  }

  if (!inEmail.validity.valid) {
    DE.signup.info.textContent = `Enter a valid email.`;
    vibrate(DE.signup.info);
    vibrate(DE.signup.submitButton);
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
      DE.signup.info.textContent = `Error signing up user: ${data.error}`;
      console.log(
        `Error signing up. ${response.status} ${response.statusText}`
      );
      vibrate(DE.signup.info);
      vibrate(DE.signup.submitButton);
      return;
    }

    if (response.ok) {
      let data = await response.json();

      if (!data.user) {
        DE.signup.info.textContent = `Error signing up user: ${data.error}`;
        console.log(
          `Error signing up. ${response.status} ${response.statusText}`
        );
        vibrate(DE.signup.info);
        vibrate(DE.signup.submitButton);
        return;
      }

      userData = data.user;
      DE.user.display.textContent = `User successfully registered.`;
      DE.user.id.textContent = `Id: ${userData.id}`;
      DE.user.email.textContent = `Email: ${userData.email}`;

      accessToken = data.accessToken;
      localStorage.setItem("accessToken", JSON.stringify(data.accessToken));

      renderUI();

      // Según el tipo de web, aquí puede cambiar la interfaz o puede
      // redirigir a otra página:
      // window.location.href = "/profile";
      DE.signup.dialog.close();
    }
  } catch (error) {
    DE.signup.info.textContent = `Error signing up user: ${error}`;
    console.error("Error signing up: ", error);
    vibrate(DE.signup.info);
    vibrate(DE.signup.submitButton);
  }
}

/**
 *
 * @param {Event} event
 */
async function handleDeleteUser(event) {
  event.preventDefault();

  let email = userData.email;

  let inputPassword = /** @type {HTMLInputElement} */ (
    document.getElementById("#delete-password")
  );

  let response = await fetch(apiURL.DELETE_USER, {
    method: "DELETE",
    credentials: "include", //hay que mandar el refreshtoken para poder denegarlo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: inputPassword.value }),
  });

  if (!response.ok) {
    let data = await response.json();
    DE.delete.info.textContent = `Error deleting user: ${data.error}`;
    vibrate(DE.delete.info);
    vibrate(DE.delete.submitButton);
    return;
  }

  if (response.ok) {
    DE.delete.info.textContent = `User successfully deleted.`;
    DE.delete.info.style.color = "green";
    DE.delete.info.style.fontWeight = "bold";

    userData = null;
    localStorage.removeItem("accessToken");

    setTimeout(() => {
      DE.delete.dialog.close();
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

  let inputCode = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-code")
  );

  let inputPassword = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-password")
  );
  let inputConfirmPass = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-confirm-password")
  );
  let inputEmail = /** @type {HTMLInputElement} */ (
    document.querySelector("#reset-email")
  );

  try {
    if (!inputCode.validity.valid) {
      DE.reset.changeInfo.textContent = `Enter a code with six characters.`;
      vibrate(DE.reset.changeInfo);
      vibrate(DE.reset.changeButton);
      return;
    }

    if (
      inputPassword.value === "" ||
      inputConfirmPass.value === "" ||
      inputEmail.value === ""
    ) {
      DE.reset.changeInfo.textContent = `Please fill in all fields.`;
      vibrate(DE.reset.changeInfo);
      vibrate(DE.reset.changeButton);
      return;
    }

    if (inputPassword.value !== inputConfirmPass.value) {
      DE.reset.changeInfo.textContent = `Passwords don't match.`;
      vibrate(DE.reset.changeInfo);
      vibrate(DE.reset.changeButton);
      return;
    }

    let response = await fetch(apiURL.CHANGE_PASS, {
      method: "POST",
      credentials: "include", //para que vaya la session cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inputEmail.value,
        pass: inputPassword.value,
        code: inputCode.value,
      }),
    });

    if (!response.ok) {
      let data = await response.json();
      DE.reset.changeInfo.textContent = `Error changing password. ${data.error}`;
      vibrate(DE.reset.changeInfo);
      vibrate(DE.reset.changeButton);
      return;
    }

    if (response.ok) {
      DE.reset.changeInfo.style.color = "green";
      DE.reset.changeInfo.style.fontWeight = "bold";

      DE.reset.changeInfo.textContent = `Password successfully changed.`;

      setTimeout(() => {
        DE.reset.dialog.close();
        return;
      }, 2000);
    }
  } catch (error) {
    console.error("Error changing password: ", error);
    DE.reset.changeInfo.textContent = `Error changing password. Try again later.`;
    vibrate(DE.reset.changeInfo);
    vibrate(DE.reset.changeButton);
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
      DE.reset.codeInfo.textContent = `Enter a valid email.`;
      vibrate(DE.reset.codeInfo);
      vibrate(DE.reset.sendButton);
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
      DE.reset.codeInfo.textContent = `Error sending code. ${data.error}`;
      vibrate(DE.reset.codeInfo);
      vibrate(DE.reset.sendButton);
      return;
    }

    if (response.ok) {
      DE.reset.codeInfo.textContent = `The secuirity code was sent to your email. 
      Check your inbox.`;
      DE.reset.codeInfo.style.color = "green";
      DE.reset.codeInfo.style.fontWeight = "bold";
      vibrate(DE.reset.codeInfo);
      vibrate(DE.reset.sendButton);
      return;
    }
  } catch (error) {
    console.error("Error sending code: ", error);
    DE.reset.codeInfo.textContent = `Error sending code. Try again later.`;
    vibrate(DE.reset.codeInfo);
    vibrate(DE.reset.sendButton);
  }
}

//- - - - - - - - - - - - - - - - - - - - - - - -
//- Event listeners - - - - - - - - - - - - - - -
//- - - - - - - - - - - - - - - - - - - - - - - -

function setEventListeners() {
  DE.login.githubButton.addEventListener("click", handleLoginGH);
  DE.login.googleButton.addEventListener("click", handleLoginGG);
  DE.login.passButton.addEventListener("click", handleLogin);
  DE.login.signupButton.addEventListener("click", (e) => {
    e.preventDefault();
    DE.signup.dialog.showModal();
  });
  DE.login.resetButton.addEventListener("click", async () => {
    DE.reset.dialog.showModal();
  });

  DE.reset.sendButton.addEventListener("click", handleSendCode);
  DE.reset.changeButton.addEventListener("click", handleChangePass);
  DE.reset.closeButton.addEventListener("click", () => {
    DE.reset.dialog.close();
    cleanInputs(DE.reset.dialog);
    DE.reset.codeInfo.textContent = "";
    DE.reset.changeInfo.textContent = "";
  });

  DE.signup.submitButton.addEventListener("click", handleSignUp);
  DE.signup.closeButton.addEventListener("click", () => {
    DE.signup.dialog.close();
    cleanInputs(DE.signup.dialog);
    DE.signup.info.textContent = "";
  });

  DE.user.logoutButton.addEventListener("click", handleLogOut);
  DE.user.deleteButton.addEventListener("click", () => {
    if (!userData) {
      // Nunca debería entrar acá, no debería mostrarse el botón de delete account si no está logueado el usuario.
      alert("User not logged in.");
      renderUI();
      return;
    }

    document.getElementById(
      "delete-user"
    ).textContent = `User: ${userData.email}`;

    DE.delete.dialog.showModal();
  });

  DE.delete.submitButton.addEventListener("click", handleDeleteUser);

  DE.delete.closeButton.addEventListener("click", () => {
    DE.delete.dialog.close();
    cleanInputs(DE.delete.dialog);
    DE.delete.info.textContent = "";
  });

  window.addEventListener("click", (event) => {
    if (event.target === DE.signup.dialog) {
      DE.signup.dialog.close();
      cleanInputs(DE.signup.dialog);
      DE.signup.info.textContent = "";
    }
    if (event.target === DE.delete.dialog) {
      DE.delete.dialog.close();
      cleanInputs(DE.delete.dialog);
      DE.delete.info.textContent = "";
    }
    if (event.target === DE.reset.dialog) {
      DE.reset.dialog.close();
      cleanInputs(DE.reset.dialog);
      DE.reset.codeInfo.textContent = "";
      DE.reset.changeInfo.textContent = "";
    }
  });
}
