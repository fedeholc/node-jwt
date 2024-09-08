import { hashPassword, generateToken } from "../util-auth.js";
import { getUserByEmail } from "../utils-db.js";

export function handleLogin(db, secretKey) {
  return async function (req, res) {
    const { user, pass, email } = req.body;
    let userResponse = await getUserByEmail(db, email);
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
