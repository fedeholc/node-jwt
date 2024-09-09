import express from "express";
import { getSecretKey } from "../secret-key.js";
import { hashPassword, generateToken } from "../util-auth.js";
import { getUserByEmail } from "../utils-db.js";
import { getDbInstance } from "../db.js";

export const loginRouter = express.Router();

loginRouter.post("/", handleLogin(getDbInstance(), getSecretKey()));

export function handleLogin(db, secretKey) {
  return async function (req, res) {
    const { pass, email } = req.body;
    let userResponse = await getUserByEmail(db, email);
    if (
      userResponse &&
      email === userResponse.email &&
      hashPassword(pass) === userResponse.pass
    ) {
      const token = await generateToken(
        {
          user: {
            id: userResponse.id,
            email: userResponse.email,
          },
        },
        secretKey
      );
      res.status(200).json({ token: token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  };
}
