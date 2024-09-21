import { hashPassword, generateToken } from "../util-auth.js";
import process from "process";
import { db, secretKey } from "../global-store.js";

export async function handleRegister(req, res) {
  try {
    const { pass, email } = req.body;

    if (!pass || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    console.log(pass, email);
    let existingUser = await db.getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ error: "User or email already exist." });
    }

    const id = await db.insertUser(email, hashPassword(pass));
    console.log("id", id);
    //TODO: WIP
    //const id = await insertUserWithTurso(dbTurso, email, hashPassword(pass));
    const token = await generateToken(
      { user: { id: id, email: email } },
      secretKey
    );

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(201).json({ user: { email: email, id: id } });
  } catch (error) {
    return res.status(500).json({ error: `Error registering user: ${error}` });
  }
}
