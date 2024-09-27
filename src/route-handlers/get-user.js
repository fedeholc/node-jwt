export async function handleGetUser(req, res) {
  if (req.payload) {
    return res.status(200).json({ user: req.payload.user });
  } else {
    return res.status(401).json({ error: "Error getting user." });
  }
}
