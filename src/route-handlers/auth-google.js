import crypto from "crypto";
import process from "process";
import { apiURL, googleEP } from "../endpoints.js";
import { hashPassword, genRefreshToken } from "../util-auth.js";
import { db, refreshCookieOptions, refreshSecretKey } from "../global-store.js";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectURI = apiURL.AUTH_GOOGLE_CALLBACK;

export function handleAuthGoogle(req, res) {
  if (!req.query.returnTo) {
    console.error("No returnTo URL provided");
    return res.status(400).json({ error: "No returnTo URL provided" });
  }
  req.session.returnTo = req.query.returnTo;
  const googleAuthURL = `${googleEP.AUTHORIZE}?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code&scope=email profile`;
  res.status(200).json({ gauth: googleAuthURL });
}

export async function handleAuthGoogleCallback(req, res) {
  try {
    const googleCode = req.query.code;
    console.log("googleCode", googleCode);
    if (!googleCode) {
      return res.status(500).send("No authorization code received");
    }

    // Request access token from Google
    const gResponse = await fetch(googleEP.ACCESS_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        code: googleCode,
        redirect_uri: redirectURI,
        grant_type: "authorization_code",
      }),
    });

    console.log("gResponse", gResponse);

    if (!gResponse.ok) {
      return res
        .status(500)
        .send(
          `Error obtaining access token from Google: ${gResponse.statusText}`
        );
    }

    const { access_token: gAccessToken } = await gResponse.json();
    if (!gAccessToken) {
      return res.status(500).send("No access token received from Google");
    }

    // Request Google user data
    const gUserResponse = await fetch(
      `${googleEP.USER}?access_token=${gAccessToken}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${gAccessToken}`,
        },
      }
    );

    const gUserData = await gUserResponse.json();
    if (!gUserResponse.ok || !gUserData || !gUserData.email) {
      return res
        .status(500)
        .send(
          `Error obtaining user data from Google: ${gUserResponse.statusText}`
        );
    }

    // Verifica si el usuario existe en la base de datos
    let userInDB = await db.getUserByEmail(gUserData.email);
    if (!userInDB) {
      const id = await db.insertUser(
        gUserData.email,
        hashPassword(crypto.randomBytes(8).toString("hex"))
      );
      req.session.user = { id: id, email: gUserData.email };
    } else {
      req.session.user = { id: userInDB.id, email: userInDB.email };
    }

    const refreshToken = await genRefreshToken(
      { user: req.session.user, rememberMe: true },
      refreshSecretKey
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions.remember);

    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
  } catch (error) {
    console.error("Error during Google authentication", error);
    res.status(500).send(error.message || "Authentication failed");
  }
}
