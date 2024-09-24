export function handleLogOut(req, res) {
  try {
    Object.keys(req.cookies).forEach((cookie) => {
      res.clearCookie(cookie);
    });
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error during logout");
      }

      res.status(200).send("ok");
    });
  } catch (error) {
    console.error("Error during logout", error);
    res.status(500).send("Error during logout");
  }
}
