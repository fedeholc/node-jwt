import { insertUser, getUserByEmail } from "../utils-db.js";
import { hashPassword, generateToken } from "../util-auth.js";
import process from "process";
import { getSecretKey } from "../secret-key.js";
import { getDbInstance } from "../db.js";

export const secretKey = getSecretKey();
export const db = await getDbInstance();

export async function handleRegister(req, res) {
  const { pass, email } = req.body;

  if (!pass || !email) {
    return res.status(400).json({ error: "All fields are required." });
  }

  let userResponse = await getUserByEmail(db, email);

  if (userResponse) {
    return res.status(409).json({ error: "User or email already exist." });
  }

  // Crear nuevo usuario
  try {
    const id = await insertUser(db, email, hashPassword(pass));
    const token = await generateToken(
      {
        user: {
          id: id,
          email: email,
        },
      },
      secretKey
    );

    res.cookie("jwtToken", token, {
      httpOnly: true, // Evita que el frontend acceda a esta cookie
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "lax", // Additional protection against CSRF
    });

    return res.status(201).json({
      user: {
        email: email,
        id: id,
      },
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error registering user: " + error });
  }
}