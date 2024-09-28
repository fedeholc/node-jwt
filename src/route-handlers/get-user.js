// eslint-disable-next-line no-unused-vars
import * as types from "../types.js";
/**
 * @param {import('express').Request & {payload: {user: types.UserPayload}}} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
export async function handleGetUser(req, res) {
  if (req.payload) {
    return res.status(200).json({ user: req.payload.user });
  } else {
    return res.status(401).json({ error: "Error getting user." });
  }
}
