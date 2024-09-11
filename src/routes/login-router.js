import express from "express";
import { getSecretKey } from "../secret-key.js";
import { getDbInstance } from "../db.js";
import { handleLogin } from "../routes/handle-login.js";

export const loginRouter = express.Router();

loginRouter.post("/", handleLogin(getDbInstance(), getSecretKey()));

