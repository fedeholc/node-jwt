import { genAccessToken } from "../util-auth.js";
import { accessSecretKey, db, refreshSecretKey } from "../global-store.js";
import { jwtVerify } from "jose";
// eslint-disable-next-line no-unused-vars
import * as types from "../types.js";

/**
 *
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
export async function handleRefreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  let isDenied = await db.isDeniedToken(refreshToken);
  if (isDenied) {
    return res.status(401).json({ error: "Refresh token denegado" });
  }

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token no proporcionado" });
  }

  try {
    let response = await jwtVerify(refreshToken, refreshSecretKey);
    if (!response) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = await genAccessToken(
      /**@type {types.TokenPayload} */ (response.payload),
      accessSecretKey
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: `Invalid refresh token. ${error}` });
  }
}
