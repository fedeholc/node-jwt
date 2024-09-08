let response = await fetch("http://127.0.0.1:3000/user-info", {
  method: "GET",
  credentials: "include", // Asegura que las cookies se envíen en la solicitud
});

console.log("Response: ", response);

if (!response.ok) {
  document.querySelector("#info").innerHTML = `
  <h2>No hay usuario autenticado.</h2>
  <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>`;

  document.querySelector("#btn-logout").style.display = "none";
  document.querySelector("#btn-login-gh").style.display = "block";
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

  document.querySelector("#btn-logout").style.display = "block";
  document.querySelector("#btn-login-gh").style.display = "none";
}

document.querySelector("#btn-logout").addEventListener("click", async () => {
  let response = await fetch("http://127.0.0.1:3000/logout", {
    method: "GET",
    credentials: "include",
  });
  console.log("Logout Response: ", response);
  if (response.ok) {
    window.location.reload();
  }
});

document.querySelector("#btn-login-gh").addEventListener("click", async () => {
  let returnTo = window.location.href;
  let response = await fetch(
    `http://127.0.0.1:3000/auth/github?returnTo=${returnTo}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  let data = await response.json();
  console.log("Login github:", data);
  window.location.href = data.ghauth;
});
