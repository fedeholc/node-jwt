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

  document.querySelector("#info").innerHTML = `
  <h2>Usuario autorizado.</h2>
  <p>Respuesta del servidor: ${response.status} ${response.statusText}</p>
  <p>Token: ${data.token}</p>`;

  document.querySelector("#btn-logout").style.display = "block";
  document.querySelector("#btn-login-gh").style.display = "none";
}

document.querySelector("button").addEventListener("click", async () => {
  // window.location.href = 'http://localhost:3000/auth/github'

  let returnTo = window.location.href;
  let response = await fetch(
    `http://localhost:3000/auth/github2?returnTo=${returnTo}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  let data = await response.json();
  window.location.href = data.ghauth;
  /*    window.location.href = "http://127.0.0.1:3000/auth/github2?returnTo=http://127.0.0.1:5500" */
  console.log(data);
});
