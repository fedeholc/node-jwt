import { jwtVerify } from "jose";
import { db, secretKey } from "../global-store.js";
export async function handleLogOut(req, res) {
  try {
    const decoded = await jwtVerify(req.cookies.refreshToken, secretKey);

    db.addToDenyList(req.cookies.refreshToken, decoded.payload.exp * 1000);

    Object.keys(req.cookies).forEach((cookie) => {
      res.clearCookie(cookie);
    });
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error during logout");
      }
      console.log("--- logged out ---");
      res.status(200).send("ok");
    });
  } catch (error) {
    console.error("Error during logout", error);
    res.status(500).send("Error during logout");
  }
}
