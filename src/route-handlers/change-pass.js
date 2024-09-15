import { getUserByEmail } from "../utils-db.js";
import { getSecretKey } from "../secret-key.js";
import { getDbInstance } from "../db.js";
import { updateUser } from "../utils-db.js";
import { hashPassword } from "../util-auth.js";

export const secretKey = getSecretKey();
export const db = await getDbInstance();

export async function handleChangePass(req, res) {
  //verify token

  if (!req.body.code) {
    return res.status(400).json({ error: "Code is required" });
  }

  if (!req.session.resetCode || req.session.resetCodeExpires < Date.now()) {
    return res
      .status(400)
      .json({ error: "El código ha expirado o no es válido." });
  }

  if (req.body.code !== req.session.resetCode) {
    return res
      .status(400)
      .json({ error: "El código ingresado es incorrecto." });
  }

  if (!req.body.pass) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!req.body.email) {
    return res.status(400).json({ error: "Email is required" });
  }

  let user = await getUserByEmail(db, req.body.email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let response = await updateUser(
    db,
    req.body.email,
    hashPassword(req.body.pass)
  );
  console.log("response", response);

  if (!response) {
    return res.status(500).json({ error: "Error updating password" });
  }

  res.status(200).json({ message: "Password updated" });
}
