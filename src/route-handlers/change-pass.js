import { getUserByEmail, updateUser } from "../utils-db.js";
import { hashPassword } from "../util-auth.js";
import { db } from "../global-store.js";

export async function handleChangePass(req, res) {
  try {
    if (!req.body.code) {
      return res.status(400).json({ error: "Code is required" });
    }

    if (
      !req.session.resetCode ||
      !req.session.resetCodeExpires ||
      req.session.resetCodeExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ error: "The code is ivalid or it has expired." });
    }

    if (req.body.code !== req.session.resetCode) {
      return res.status(400).json({ error: "The entered code is incorrect" });
    }

    if (!req.body.pass) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!req.body.email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await getUserByEmail(db, req.body.email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await updateUser(
      db,
      req.body.email,
      hashPassword(req.body.pass)
    );

    if (!response) {
      return res.status(500).json({ error: "Error updating password" });
    }

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.error("Error in handleChangePass", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
