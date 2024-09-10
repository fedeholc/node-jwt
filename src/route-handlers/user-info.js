import { getSecretKey } from "../secret-key.js";
import { jwtVerify } from "jose";
export { handleUserInfo };

const secretKey = getSecretKey();

async function handleUserInfo(req, res) {
  if (!req.cookies) {
    return res.status(401).json({ error: "nocookies" });
  }
  const githubToken = req.cookies.authToken;
  //VER ARCHIVOS FLUJO OFFLINE.MD
  //TODO: tendría que llamarlo githubToken?
  //TODO: pero ojo! está bien traer la info de github? no debería traerla de mi bd?
  //VER o sea, el loguin sirve para evitar el pass, pero después de eso no debería depender del servidor de github, pero que info guardar en una cookie para dar acceso? uso JWT???
  //TODO: de esa forma es un solo jwt (tendrìa que generarlo al registrar con github tambièn)
  //TODO: un problema podría ser si el usuario cambia de mail en github y luego quiere entrar va a aparecer como nuevo usuario... salvo que guarde el gh id, pero ya es mucho.

  //TODO: qué pasa si hay otros providers? tengo que checkiar de quién es el token?
  const jwtToken = req.cookies.jwtToken;
  if (jwtToken) {
    let userJWT = await jwtVerify(jwtToken, secretKey);
    console.log("userJWT", userJWT);
    if (userJWT) {
      req.session.user = userJWT.payload.user;
      return res.status(200).json({ user: req.session.user });
    }
  }

  if (!githubToken) {
    return res.status(401).json({ error: "No user authenticated" });
  }

  //TODO: está parte está repetida en github callback, hacer función
  const userResponse = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${githubToken}`,
    },
  });
  if (!userResponse.ok) {
    return res.status(400).send("Error obtaining user data");
  }

  const user = await userResponse.json();

  req.session.user = user;

  if (!req.session.user) {
    //VER debería hacer un logout y redirigir al login?
    return res.status(401).json({ error: "User not authenticated" });
  }

  res.status(200).json({ token: githubToken, user: req.session.user });
}
