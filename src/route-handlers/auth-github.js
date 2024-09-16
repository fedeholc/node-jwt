export { handleAuthGitHub, handleAuthGitHubCallback };
import { apiURL, gitHubEP } from "../endpoints.js";
import process from "process";
import { getUserByEmail, insertUser } from "../utils-db.js";
import { hashPassword, generateToken } from "../util-auth.js";
import { getSecretKey } from "../secret-key.js";
import { getDbInstance } from "../db.js";

export const secretKey = getSecretKey();
export const db = await getDbInstance();

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const redirectURI = apiURL.AUTH_GITHUB_CALLBACK;

function handleAuthGitHub(req, res) {
  req.session.returnTo = req.query.returnTo || req.get("referer") || "/";

  const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&redirect_uri=${redirectURI}`;

  res.status(200).json({ ghauth: githubAuthURL });
}

async function handleAuthGitHubCallback(req, res) {
  try {
    const gitHubCode = req.query.code;
    if (!gitHubCode) {
      return res.status(500).send("No authorization code received");
    }

    // Solicita el token de acceso a GitHub
    const ghResponse = await fetch(gitHubEP.ACCESS_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        code: gitHubCode,
        redirect_uri: redirectURI,
      }),
    });
    const { access_token: ghAccessToken } = await ghResponse.json();

    if (!ghResponse.ok || !ghAccessToken) {
      return res
        .status(500)
        .send(
          "Error obtaining access token from GitHub" + ghResponse.statusText
        );
    }

    // Solicita los datos del usuario de GitHub
    const ghUserResponse = await fetch(gitHubEP.USER, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ghAccessToken}`,
      },
    });
    const ghUserData = await ghUserResponse.json();

    if (!ghUserResponse.ok || !ghUserData || !ghUserData.email) {
      return res
        .status(500)
        .send(
          "Error obtaining user data from GitHub" + ghUserResponse.statusText
        );
    }

    // Verifica si el usuario existe en la base de datos
    let userInDB = await getUserByEmail(db, ghUserData.email);
    if (!userInDB) {
      const id = await insertUser(
        db,
        ghUserData.email,
        hashPassword(crypto.randomBytes(8).toString("hex"))
      );
      req.session.user = { id: id, email: ghUserData.email };
    } else {
      req.session.user = { id: userInDB.id, email: userInDB.email };
    }

    // Genera el token JWT
    const jwtToken = await generateToken({ user: req.session.user }, secretKey);
    res.cookie("jwtToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "lax", // Additional protection against CSRF
    });

    let returnTo = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (error) {
    console.error("Error during GitHub authentication", error.message);
    res.status(500).send(error.message || "Authentication failed");
  }
}
