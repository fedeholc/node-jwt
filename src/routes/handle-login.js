import { hashPassword, generateToken } from "../util-auth.js";
import { getUserByEmail } from "../utils-db.js";
import process from "process";
 

import { db } from "../global-store.js";
import { secretKey } from "../global-store.js";

 

export async function handleLogin(req, res) {
  console.log("db y secret", db, secretKey);
  try {
    const { pass, email } = req.body;
    let userInDB = await getUserByEmail(db, email);
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
        httpOnly: true, // Evita que el frontend acceda a esta cookie
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "lax", // Additional protection against CSRF
      });

      return res.status(200).json({
        user: { email: userInDB.email, id: userInDB.id },
        token: jwtToken,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error logging in user: " + error });
  }
}
