export { sessionCounter };

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
