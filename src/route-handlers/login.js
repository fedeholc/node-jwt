import { hashPassword, genAccessToken, genRefreshToken } from "../util-auth.js";
import {
  accessSecretKey,
  refreshSecretKey,
  db,
  refreshCookieOptions,
} from "../global-store.js";

export async function handleLogin(req, res) {
  try {
    const { pass, email, rememberMe } = req.body;
    const userInDB = await db.getUserByEmail(email);
    if (
      userInDB &&
      email === userInDB.email &&
      hashPassword(pass) === userInDB.pass
    ) {
      const accessToken = await genAccessToken(
        {
          user: { id: userInDB.id, email: userInDB.email },
          rememberMe: rememberMe,
        },
        accessSecretKey
      );

      //se genera el refresh cada vez que se loguea pues, si ya tuviera uno, se hubiera logueado automaticamente
      const refreshToken = await genRefreshToken(
        {
          user: { id: userInDB.id, email: userInDB.email },
          rememberMe: rememberMe,
        },
        refreshSecretKey
      );

      res.cookie(
        "refreshToken",
        refreshToken,
        rememberMe
          ? refreshCookieOptions.remember
          : refreshCookieOptions.noRemember
      );

      return res.status(200).json({
        user: { email: userInDB.email, id: userInDB.id },
        accessToken: accessToken,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: `Error logging in user: ${error}` });
  }
}
