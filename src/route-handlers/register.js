import { hashPassword, genAccessToken, genRefreshToken } from "../util-auth.js";
import process from "process";
import {
  accessSecretKey,
  db,
  refreshCookieOptions,
  refreshSecretKey,
} from "../global-store.js";

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

    const accessToken = await genAccessToken(
      { user: { id: id, email: email }, rememberMe: false },
      accessSecretKey
    );
    const refreshToken = await genRefreshToken(
      { user: { id: id, email: email, rememberMe: false } },
      refreshSecretKey
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: refreshCookieOptions.noRemember,
    });

    return res.status(200).json({
      user: { email: email, id: id },
      accessToken: accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: `Error registering user: ${error}` });
  }
}
