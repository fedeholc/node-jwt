import {
  hashPassword,
  generateToken,
  genAccessToken,
  genRefreshToken,
} from "../util-auth.js";
import process from "process";
import { db } from "../global-store.js";
import { secretKey } from "../global-store.js";

export async function handleLoginART(req, res) {
  try {
    const { pass, email } = req.body;
    const userInDB = await db.getUserByEmail(email);
    if (
      userInDB &&
      email === userInDB.email &&
      hashPassword(pass) === userInDB.pass
    ) {
      //TODO: tener dos secretkey distintas para el access y el refresh token
      //y ver que esto se repite en register (también en los auth), pasar a una función
      const accessToken = await genAccessToken(
        { user: { id: userInDB.id, email: userInDB.email } },
        secretKey
      );
      const refreshToken = await genRefreshToken(
        { user: { id: userInDB.id, email: userInDB.email } },
        secretKey
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

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
