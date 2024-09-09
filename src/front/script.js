//TODO: no hardocear la URL del servidor y demas
const apiBase = {
  DEV: "http://127.0.0.1:3000",
  PROD: "https://api.example.com",
};

let env;
if (window.location.hostname === "127.0.0.1") {
  env = "DEV";
} else {
  env = "PROD";
}

const apiEP = {
  AUTH_GITHUB: "/auth/github",
  AUTH_GITHUB_CALLBACK: "/auth/github/callback",
  LOGIN: "/login",
  LOGIN_2: "/login2",
  LOGOUT: "/logout",
  PROFILE: "/profile",
  PROFILE_X: "/profileX",
  REGISTER: "/register",
  ROOT: "/",
  USER_INFO: "/user-info",
};
const apiURL = {
  BASE: apiBase[env],
  AUTH_GITHUB: apiBase[env] + apiEP.AUTH_GITHUB,
  AUTH_GITHUB_CALLBACK: apiBase[env] + apiEP.AUTH_GITHUB_CALLBACK,
  LOGIN: apiBase[env] + apiEP.LOGIN,
  LOGIN_2: apiBase[env] + apiEP.LOGIN_2,
  LOGOUT: apiBase[env] + apiEP.LOGOUT,
  PROFILE: apiBase[env] + apiEP.PROFILE,
  PROFILE_X: apiBase[env] + apiEP.PROFILE_X,
  REGISTER: apiBase[env] + apiEP.REGISTER,
  ROOT: apiBase[env] + apiEP.ROOT,
  USER_INFO: apiBase[env] + apiEP.USER_INFO,
};

try {
  let response = await fetch(apiURL.USER_INFO, {
    method: "GET",
    credentials: "include", // Asegura que las cookies se envíen en la solicitud
  });

  console.log("Response2: ", response);

  if (!response.ok) {
    document.querySelector("#info").innerHTML = `
    <h2>No hay usuario autenticado.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>`;

    /* document.querySelector("#btn-logout").style.display = "none";
  document.querySelector("#btn-login-gh").style.display = "block"; */
  }

  if (response.ok) {
    let data = await response.json();
    console.log("Data:", data);

    //TODO: validar que estén los datos esperados

    document.querySelector("#info").innerHTML = `
  <h2>Usuario autorizado.</h2>
  <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
  <p>User: ${data.user.email}</p>
  <p>Token: ${data.token}</p>`;

    /*   document.querySelector("#btn-logout").style.display = "block";
  document.querySelector("#btn-login-gh").style.display = "none"; */
  }
} catch (error) {
  console.error("Error de red o en la solicitud:", error);
  throw error; // Propagamos el error para que pueda ser manejado más arriba si es necesario
}

document.querySelector("#btn-logout").addEventListener("click", async () => {
  let response = await fetch(apiURL.LOGOUT, {
    method: "GET",
    credentials: "include",
  });
  console.log("Logout Response: ", response);
  if (response.ok) {
    window.location.reload();
  }
});

document
  .querySelector("#btn-login-gh")
  .addEventListener("click", async (event) => {
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

document
  .querySelector("#btn-login")
  .addEventListener("click", async (event) => {
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
      document.querySelector("#info").innerHTML = `
    <h2>Error al iniciar sesión.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>Error: ${data.error}</p>`;
    }

    if (response.ok) {
      let data = await response.json();
      document.querySelector("#info").innerHTML = `
    <h2>Sesión iniciada.</h2>
    <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
    <p>User: ${data.user.id} - ${data.user.email}</p>
    <p>Token: ${data.token}</p>`;
      //window.location.reload();
    }
  });

document
  .querySelector("#btn-signup")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;

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
      document.querySelector("#info").innerHTML = `
      <h2>Error al registrar usuario.</h2>
      <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
      <p>Error: ${data.error}</p>`;
    }

    if (response.ok) {
      let data = await response.json();
      document.querySelector("#info").innerHTML = `
      <h2>Usuario registrado.</h2>
      <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
      <p>User: ${data.user.id} - ${data.user.email}</p>
      <p>Token: ${data.token}</p>`;
      //window.location.reload();
    }
  });
