import { hashPassword, generateToken } from "../util-auth.js";
import { getUserByEmail } from "../utils-db.js";
import process from "process";
import { db } from "../global-store.js";
import { secretKey } from "../global-store.js";

export async function handleLogin(req, res) {
  try {
    const { pass, email } = req.body;
    const userInDB = await db.getUserByEmail(email);
    if (
      userInDB &&
      email === userInDB.email &&
      hashPassword(pass) === userInDB.pass
    ) {
      const jwtToken = await generateToken(
        { user: { id: userInDB.id, email: userInDB.email } },
        secretKey
      );
      res.cookie("jwtToken", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return res.status(200).json({
        user: { email: userInDB.email, id: userInDB.id },
        token: jwtToken,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ error: `Error logging in user: ${error}` });
  }
}
