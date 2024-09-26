export { handleAuthGitHub, handleAuthGitHubCallback };

import crypto from "crypto";
import process from "process";
import { apiURL, gitHubEP } from "../endpoints.js";
import { hashPassword, genRefreshToken } from "../util-auth.js";
import { db, secretKey } from "../global-store.js";

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const redirectURI = apiURL.AUTH_GITHUB_CALLBACK;

function handleAuthGitHub(req, res) {
  if (!req.query.returnTo) {
    console.error("No returnTo URL provided");
    return res.status(400).json({ error: "No returnTo URL provided" });
  }
  req.session.returnTo = req.query.returnTo;

  const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&scope=user:email&redirect_uri=${redirectURI}`;

  res.status(200).json({ ghauth: githubAuthURL });
}

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
    let userInDB = await db.getUserByEmail(ghUserData.email);
    if (!userInDB) {
      const id = await db.insertUser(
        ghUserData.email,
        hashPassword(crypto.randomBytes(8).toString("hex"))
      );
      req.session.user = { id: id, email: ghUserData.email };
    } else {
      req.session.user = { id: userInDB.id, email: userInDB.email };
    }

    const refreshToken = await genRefreshToken(
      { user: req.session.user },
      secretKey
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
  } catch (error) {
    console.error("Error during GitHub authentication", error);
    res.status(500).send(error.message || "Authentication failed");
  }
}
