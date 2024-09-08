export { handleUserInfo };
async function handleUserInfo(req, res) {
  if (!req.cookies) {
    return res.status(401).json({ error: "nocookies" });
  }
  const accessToken = req.cookies.authToken;

  //TODO: qué pasa si hay otros providers? tengo que checkiar de quién es el token?

  if (!accessToken) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  //TODO: está parte está repetida en github callback, hacer función
  const userResponse = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!userResponse.ok) {
    return res.status(400).send("Error obtaining user data");
  }

  //TODO: está bien traer la info de github? no debería traerla de mi bd?
  //VER o sea, el loguin sirve para evitar el pass, pero después de eso no debería depender del servidor de github, pero que info guardar en una cookie para dar acceso? uso JWT???

  const user = await userResponse.json();

  req.session.user = user;

  if (!req.session.user) {
    //VER debería hacer un logout y redirigir al login?
    return res.status(401).json({ error: "User not authenticated" });
  }

  res.status(200).json({ token: accessToken, user: req.session.user });
}
