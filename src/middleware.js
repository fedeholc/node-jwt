export { sessionCounter, ensureAuthenticated };


function ensureAuthenticated(req, res, next) {
  //TODO: tendría que poner un isAuth en la session para no tener que hacer esto? ambas?
  if (req.session.user) {
    console.log("ensure session user", req.session.user.id);
  } else {
    console.log("ensure session no user", req.session.user);
  }
  console.log("ensure user:", req.user);
  if (req.session.user) {
    return next(); // Usuario autenticado, continúa con la solicitud
  } else {
    console.log("User not authenticated");
    //TODO: ojo, si se redirecciona a /auth/github se reloguea
    res.redirect("/nolog"); // Redirige a la página de inicio de sesión si no está autenticado
    //
  }
}

function sessionCounter(req, res, next) {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  console.log(
    `Sesion id: ${req.session.id} - cantidad de requests: ${req.session.count}`
  );
  next();
}
