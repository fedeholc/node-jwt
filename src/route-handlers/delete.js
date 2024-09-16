import { deleteUser, getUserByEmail } from "../utils-db.js";
import { hashPassword } from "../util-auth.js";
import { db } from "../global-store.js";

export async function handleDeleteUser(req, res) {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let userResponse = await getUserByEmail(db, email);
    if (!userResponse) {
      return res.status(404).json({ error: "User not found." });
    }

    if (hashPassword(pass) !== userResponse.pass) {
      return res.status(401).json({ error: "Invalid password." });
    }

    await deleteUser(db, email);

    //hacer logout y borrar sesion
    res.clearCookie("jwtToken");
    req.session.destroy();

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ error: "Error deleting user: " + error });
  }
}
