import { hashPassword } from "../util-auth.js";
import { db } from "../global-store.js";
import { jwtVerify } from "jose";
import { secretKey } from "../global-store.js";

export async function handleDeleteUser(req, res) {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let userResponse = await db.getUserByEmail(email);
    if (!userResponse) {
      return res.status(404).json({ error: "User not found." });
    }

    if (hashPassword(pass) !== userResponse.pass) {
      return res.status(401).json({ error: "Invalid password." });
    }

    let response = await db.deleteUser(email);

    if (!response) {
      return res.status(500).json({ error: "Error deleting user." });
    }

    // añañdir el token a la lista de denegados
     const decoded = await jwtVerify(req.cookies.refreshToken, secretKey);
     db.addToDenyList(req.cookies.refreshToken, decoded.payload.exp * 1000);

    //hacer logout y borrar sesion
    Object.keys(req.cookies).forEach((cookie) => {
      res.clearCookie(cookie);
    });
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: `Error destroying session: ${err}` });
      }
    });

      
 
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ error: `Error deleting user: ${error}` });
  }
}
