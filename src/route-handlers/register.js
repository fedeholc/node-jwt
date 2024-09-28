import { hashPassword, genAccessToken, genRefreshToken } from "../util-auth.js";
// eslint-disable-next-line no-unused-vars
import process from "process";
import {
  accessSecretKey,
  db,
  refreshCookieOptions,
  refreshSecretKey,
} from "../global-store.js";

// eslint-disable-next-line no-unused-vars
import * as types from "../types.js";

/**
 * @param {import('express').Request  } req - The request object.
 * @param {import('express').Response} res - The response object.
 */
export async function handleRegister(req, res) {
  try {
    const { pass, email } = req.body;

    if (!pass || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let userInDb = await db.getUserByEmail(email);
    if (userInDb) {
      return res.status(409).json({ error: "User or email already exist." });
    }

    const id = await db.insertUser(email, hashPassword(pass));

    /** @type {types.UserPayload} */
    const user = { id: id, email: email };

    /** @type {types.TokenPayload} */
    const payload = { user: user, rememberMe: false };

    const accessToken = await genAccessToken(payload, accessSecretKey);
    const refreshToken = await genRefreshToken(payload, refreshSecretKey);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions.noRemember);

    return res.status(200).json({
      user: user,
      accessToken: accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: `Error registering user: ${error}` });
  }
}
