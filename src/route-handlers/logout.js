export function handleLogOut(req, res) {
  Object.keys(req.cookies).forEach((cookie) => {
    res.clearCookie(cookie);
  });
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error during logout");
    }
    //res.clearCookie("connect.sid"); // Limpiar la cookie de sesión

    res.status(201).send("ok"); // Redirige a la página de inicio
  });
}
