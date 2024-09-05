import express from "express";
import { getSecretKey } from "../secret-key.js";
import { hashPassword, generateToken } from "../util-auth.js";
import { getUserByEmail } from "../utils-db.js";
import { getDbInstance } from "../db.js";

export const loginRouter = express.Router();

loginRouter.post("/", routeLogin(getDbInstance(), getSecretKey()));

function routeLogin(db, secretKey) {
  return async (req, res) => {
    const { user, pass, email } = req.body;
    let userResponse = await getUserByEmail(db, email);
    console.log(userResponse, req.body);
    if (
      userResponse &&
      user === userResponse.user &&
      hashPassword(pass) === userResponse.pass
    ) {
      const token = await generateToken(
        {
          id: userResponse.id,
          user: userResponse.user,
          email: userResponse.email,
        },
        secretKey
      );
      res.status(201).json({ token: token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  };
}
