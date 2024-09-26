import { apiURL } from "./endpoints-front.js";

//TODO: que no sean globales, declararlas en main y pasarlas por parámetro
let userData = null;
let accessToken = null;

const dialogSignup = document.getElementById("dialog-signup");
const btnOpenSignup = document.getElementById("btn-signup-open");
const btnCloseSignup = document.getElementById("close-signup");
const signupInfo = document.querySelector("#signup-info");

const dialogDelete = document.getElementById("dialog-delete");
const btnOpenDelete = document.getElementById("btn-delete-open");
const btnCloseDelete = document.getElementById("close-delete");
const btnDelete = document.getElementById("btn-delete");
const deleteInfo = document.querySelector("#delete-info");

const dialogReset = document.getElementById("dialog-reset");
const btnOpenReset = document.getElementById("btn-reset-open");
const btnCloseReset = document.getElementById("close-reset");
const btnChangePass = document.getElementById("btn-change-password");
const btnSendCode = document.getElementById("btn-send-code");
const codeInfo = document.querySelector("#code-info");
const changeInfo = document.querySelector("#change-info");

const btnLogout = document.getElementById("btn-logout");
const btnLoginGH = document.getElementById("btn-login-gh");
const btnLoginGG = document.getElementById("btn-login-gg");

const btnLogin = document.getElementById("btn-login");
const btnSignUp = document.getElementById("btn-signup");

const userInfoDisplay = document.getElementById("user-info-display");
const userInfoId = document.getElementById("user-info-id");
const userInfoEmail = document.getElementById("user-info-email");

document.addEventListener("DOMContentLoaded", main);

//TODO: implementar un getAccessToken global para no tener que hacerlo en cada función
async function main() {
  setEventListeners();

  accessToken = await getAccessToken();

  userData = await getUserData();
  //loadUserData();

  renderUI();
}

function cleanInputs(parent) {
  let inputs = parent.querySelectorAll("input");
  inputs.forEach((input) => {
    input.value = "";
  });
}

//TODO: faltan trycatch en nuevas funciones
async function getNewAccessToken() {
  const response = await fetch(apiURL.REFRESH, {
    method: "POST",
    credentials: "include", // Esto asegura que la cookie HTTP-only se envíe con la solicitud
  });
  const data = await response.json();
  if (data.accessToken) {
    return data.accessToken;
  } else {
    return null;
  }
}

function isTokenExpired(token) {
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      let expired = decodedToken.exp < currentTime;
      return expired;
    } catch (error) {
      console.error("Error decoding token: ", error);
      return true;
    }
  }
  return true;
}

async function getAccessToken() {
  let accessToken = JSON.parse(localStorage.getItem("accessToken"));
  if (!accessToken || isTokenExpired(accessToken)) {
    let newAccessToken = await getNewAccessToken();
    if (newAccessToken) {
      localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
      return newAccessToken;
    } else {
      return null;
    }
  } else {
    return accessToken;
  }
}

async function getUserData() {
  try {
    if (!accessToken) {
      console.log("no token");
      return null;
    }
    console.log("hago fetch with token");

    //let response = await fetch(apiURL.USER_INFO, {
    let response = await fetch(apiURL.GET_USER, {
      method: "GET",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("rta fetch with token: ", response);

    if (!response.ok) {
      console.log(
        `No user authenticated: ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (response.ok) {
      let data = await response.json();
      if (!data.user) {
        console.log(`No user data. ${response.status} ${response.statusText}`);
        return null;
      }
      userInfoId.textContent = `Id: ${data.user.id}`;
      userInfoEmail.textContent = `Email: ${data.user.email}`;

      return data.user;
    }
  } catch (error) {
    console.error(`Error loading user data: ${error}`);
    return null;
  }
}

function vibrate(element) {
  element.classList.add("vibrate");
  setTimeout(() => {
    element.classList.remove("vibrate");
  }, 300);
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
    body: JSON.stringify({ email: email, pass: password }),
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
    userInfoId.textContent = `Id: ${data.user.id}`;
    userInfoEmail.textContent = `Email: ${data.user.email}`;

    renderUI();

    console.log("response data: ", data);

    localStorage.setItem("accessToken", JSON.stringify(data.accessToken));

    return;
  }
}

async function handleLoginGH(event) {
  event.preventDefault();
  let response = await fetch(apiURL.AUTH_GITHUB, {
    method: "GET",
    credentials: "include", //estás credentials sí son necesarias, para el envío de la cookie de session y el returnTo
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();

  window.location.href = data.ghauth;
}

async function handleLoginGG(event) {
  event.preventDefault();
  let response = await fetch(apiURL.AUTH_GOOGLE, {
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

async function handleSignUp(event) {
  event.preventDefault();
  let inputEmail = document.querySelector("#su-email");
  let email = document.querySelector("#su-email").value;
  let password = document.querySelector("#su-password").value;
  let confirmPassword = document.querySelector("#su-confirm-password").value;

  if (email === "" || password === "" || confirmPassword === "") {
    signupInfo.textContent = `Please fill in all fields.`;
    vibrate(signupInfo);
    vibrate(btnSignUp);
    return;
  }

  if (password !== confirmPassword) {
    signupInfo.textContent = `Passwords don't match.`;
    vibrate(signupInfo);
    vibrate(btnSignUp);
    return;
  }

  if (!inputEmail.validity.valid) {
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
      body: JSON.stringify({ email: email, pass: password }),
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
      userInfoId.textContent = `Id: ${data.user.id}`;
      userInfoEmail.textContent = `Email: ${data.user.email}`;

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

async function handleDeleteUser(event) {
  event.preventDefault();

  let email = userData.email;
  let password = document.querySelector("#delete-password").value;

  let response = await fetch(apiURL.DELETE_USER, {
    method: "DELETE",
    credentials: "include", //hay que mandar el refreshtoken para poder denegarlo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, pass: password }),
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

async function handleChangePass(event) {
  event.preventDefault();

  let codeInput = document.querySelector("#reset-code");

  let code = document.querySelector("#reset-code").value;
  let pass = document.querySelector("#reset-password").value;
  let confirmPass = document.querySelector("#reset-confirm-password").value;
  let email = document.querySelector("#reset-email").value;

  try {
    if (!codeInput.validity.valid) {
      changeInfo.textContent = `Enter a code with six characters.`;
      vibrate(changeInfo);
      vibrate(btnChangePass);
      return;
    }

    if (pass === "" || confirmPass === "" || email === "") {
      changeInfo.textContent = `Please fill in all fields.`;
      vibrate(changeInfo);
      vibrate(btnChangePass);
      return;
    }

    if (pass !== confirmPass) {
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
      body: JSON.stringify({ email: email, pass: pass, code: code }),
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

async function handleSendCode(e) {
  e.preventDefault();

  try {
    let inputEmail = document.querySelector("#reset-email");
    let email = inputEmail.value;

    if (!inputEmail.validity.valid) {
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
      body: JSON.stringify({ email: email }),
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

function renderUI() {
  cleanInputs(document);
  if (userData) {
    //logged in UI
    document.getElementById("login-section").style.display = "none";
    document.getElementById("user-section").style.display = "flex";
  } else {
    //logged out UI
    document.getElementById("login-section").style.display = "flex";
    document.getElementById("user-section").style.display = "none";
  }
}

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
    /*     document.querySelector("#email").removeAttribute("required");
    document.querySelector("#password").removeAttribute("required"); */
    e.preventDefault();
    dialogSignup.showModal();
  });

  btnCloseSignup.addEventListener("click", () => {
    dialogSignup.close();
    cleanInputs(dialogSignup);
    signupInfo.textContent = "";
    /*     document.querySelector("#email").setAttribute("required", "");
    document.querySelector("#password").setAttribute("required", ""); */
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
