import { hashPassword, generateToken } from "../util-auth.js";
import { getUserByEmail } from "../utils-db.js";
import process from "process";

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
      res.cookie("jwtToken", token, {
        httpOnly: true, // Evita que el frontend acceda a esta cookie
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "lax", // Additional protection against CSRF
      });

      return res.status(200).json({
        user: {
          email: userResponse.email,
          id: userResponse.id,
        },
        token: token,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  };
}
