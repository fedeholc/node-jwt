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

  const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&redirect_uri=${redirectURI}&scope=user:email`;

  res.status(200).json({ ghauth: githubAuthURL });
}

async function handleAuthGitHubCallback(req, res) {
    try {
      const gitHubCode = req.query.code;
      if (!gitHubCode) {
        throw new Error("No authorization code received");
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

      if (!ghResponse.ok) {
        throw new Error(`GitHub error: ${ghResponse.statusText}`);
      }

      const { access_token: ghAccessToken } = await ghResponse.json();
      if (!ghAccessToken) {
        throw new Error("Error obtaining access token from GitHub");
      }

      // Solicita los datos del usuario de GitHub
      const ghUserResponse = await fetch(gitHubEP.USER, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ghAccessToken}`,
        },
      });

      if (!ghUserResponse.ok) {
        throw new Error(
          `Error fetching GitHub user: ${ghUserResponse.statusText}`
        );
      }

      const ghUserData = await ghUserResponse.json();
      if (!ghUserData || !ghUserData.email) {
        throw new Error("Invalid GitHub user data");
      }

      // Verifica si el usuario existe en la base de datos
      let userInDB = await getUserByEmail(db, ghUserData.email);
      if (!userInDB) {
        const timestamp = Date.now();
        const id = await insertUser(
          db,
          ghUserData.email,
          hashPassword(timestamp.toString())
        );
        req.session.user = { id: id, email: ghUserData.email };
      } else {
        req.session.user = { id: userInDB.id, email: userInDB.email };
      }

      // Genera el token JWT
      const jwtToken = await generateToken(
        { user: req.session.user },
        secretKey
      );
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
