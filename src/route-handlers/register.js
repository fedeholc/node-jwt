import { insertUser, getUserByEmail } from "../utils-db.js";
import { hashPassword, generateToken } from "../util-auth.js";

export function handleRegister(db, secretKey) {
  return async function (req, res) {
    const { user, pass, email } = req.body;

    if (!user || !pass || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let userResponse = await getUserByEmail(db, email);

    if (userResponse) {
      return res.status(409).json({ error: "User or email already exist." });
    }

    // Crear nuevo usuario
    try {
      const id = await insertUser(db, user, email, hashPassword(pass));

      const token = await generateToken(
        {
          id: id,
          user: user,
          email: email,
        },
        secretKey
      );

      return res.status(201).json({
        mensaje: "User succesfully registered. Id: " + id,
        token: token,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error registering user: " + error });
    }
  };
}
