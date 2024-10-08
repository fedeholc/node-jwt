export { handleAuthGitHub, handleAuthGitHubCallback };

import crypto from "crypto";
import process from "process";
import { apiURL, gitHubEP } from "../endpoints.js";
import { hashPassword, genRefreshToken } from "../util-auth.js";
import { db, refreshCookieOptions, refreshSecretKey } from "../global-store.js";
// eslint-disable-next-line no-unused-vars
import * as types from "../types.js";

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const redirectURI = apiURL.AUTH_GITHUB_CALLBACK;

//TODO: OJO, ver tambièn en google, acà no hay opcion de rememberme, ni si quiera es enviada por el cliente

/**
 * @param {import('express').Request & {session: import('express-session').Session & Partial<import('express-session').SessionData> & { returnTo?: string }}} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
function handleAuthGitHub(req, res) {
  if (!req.query.returnTo) {
    console.error("No returnTo URL provided");
    return res.status(400).json({ error: "No returnTo URL provided" });
  }
  req.session.returnTo = /**@type {string} */ (req.query.returnTo);

  const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&scope=user:email&redirect_uri=${redirectURI}`;

  res.status(200).json({ ghauth: githubAuthURL });
}

/**
 * @param {import('express').Request & {query: {code: string}} & {session: import('express-session').Session & Partial<import('express-session').SessionData> & { user?: types.UserPayload, returnTo?: string }}} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
async function handleAuthGitHubCallback(req, res) {
  try {
    const gitHubCode = req.query.code;
    if (!gitHubCode) {
      return res.status(500).send("No authorization code received");
    }

    // Request access token from GitHub
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
      return res
        .status(500)
        .send(
          `Error obtaining access token from GitHub: ${ghResponse.statusText}`
        );
    }

    const { access_token: ghAccessToken } = await ghResponse.json();

    if (!ghAccessToken) {
      return res.status(500).send("No access token received from GitHub");
    }

    // Request GitHub user data
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
          `Error obtaining user data from GitHub: ${ghUserResponse.statusText}`
        );
    }

    // Verifica si el usuario existe en la base de datos
    /**@type {types.UserPayload} */
    let userInDB = await db.getUserByEmail(ghUserData.email);
    if (!userInDB) {
      const id = await db.insertUser(
        ghUserData.email,
        hashPassword(crypto.randomBytes(8).toString("hex"))
      );
      req.session.user = { id: id, email: ghUserData.email };
    } else {
      req.session.user = userInDB;
    }

    const refreshToken = await genRefreshToken(
      { user: req.session.user, rememberMe: true },
      refreshSecretKey
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions.remember);
    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
  } catch (error) {
    console.error("Error during GitHub authentication", error);
    res.status(500).send(error.message || "Authentication failed");
  }
}
