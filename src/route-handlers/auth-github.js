export { handleAuthGitHub, handleAuthGitHubCallback };
import { apiURL, gitHubEP } from "../endpoints.js";
import process from "process";
import { getUserByEmail, insertUser } from "../utils-db.js";
import { hashPassword, generateToken } from "../util-auth.js";

import { db } from "../app.js";
const secretKey = process.env.SECRET_KEY;

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const redirectURI = apiURL.AUTH_GITHUB_CALLBACK;

function handleAuthGitHub(req, res) {
  req.session.returnTo = req.query.returnTo || req.get("referer") || "/";

  const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&redirect_uri=${redirectURI}&scope=user:email`;

  res.status(200).json({ ghauth: githubAuthURL });
}

async function handleAuthGitHubCallback(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("No authorization code received");
  }

  try {
    const tokenResponse = await fetch(gitHubEP.ACCESS_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", // Recibe la respuesta en formato JSON
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectURI,
      }),
    });
    const tokenData = await tokenResponse.json();
    const githubToken = tokenData.access_token;
    if (!githubToken) {
      return res.status(400).send("Error obtaining access token");
    }

    const userResponse = await fetch(gitHubEP.USER, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });
    if (!userResponse.ok) {
      return res.status(400).send("Error obtaining user data");
    }

    const gitHubUser = await userResponse.json();

    req.session.user = gitHubUser;
    req.session.accessToken = githubToken;

    //TODO: debería checkiar si el usuario ya existe en la db y si no crearlo

    const userInDB = await getUserByEmail(gitHubUser.email);
    if (!userInDB) {
      try {
        const timestamp = Date.now();

        //TODO: db y secretkey me tienen que llegar en la funciòn
        const id = await insertUser(
          db,
          gitHubUser.email,
          hashPassword(timestamp.toString())
        );
        const token = await generateToken(
          {
            user: {
              id: id,
              email: gitHubUser.email,
            },
          },
          secretKey
        );

        res.cookie("jwtToken", token, {
          httpOnly: true, // Evita que el frontend acceda a esta cookie
          secure: false, //TODO: Cambiar a true en producción con HTTPS
        });

        /*  return res.status(201).json({
          user: {
            email: email,
            id: id,
          },
          token: token,
        }); */
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Error registering user: " + error });
      }
    } else {
      //TODO: si el usuario ya existe
      res.cookie("authToken", githubToken, {
        httpOnly: true, // Evita que el frontend acceda a esta cookie
        secure: false, // Cambiar a true en producción con HTTPS
      });

      const token = await generateToken(
        {
          user: {
            id: userInDB.id,
            email: userInDB.email,
          },
        },
        secretKey
      );

      res.cookie("jwtToken", token, {
        httpOnly: true, // Evita que el frontend acceda a esta cookie
        secure: false, //TODO: Cambiar a true en producción con HTTPS
      });

      let returnTo = req.session.returnTo || "/";
      delete req.session.returnTo; // Elimina la URL de la sesión después de redirigir

      res.redirect(returnTo);
    }
  } catch (error) {
    console.error("Error during authentication", error);
    res.status(500).send("Authentication failed");
  }
}
