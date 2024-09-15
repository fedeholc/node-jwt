import nodemailer from "nodemailer";

import { insertUser, getUserByEmail } from "../utils-db.js";
import { hashPassword, generateToken } from "../util-auth.js";
import process from "process";
import { getSecretKey } from "../secret-key.js";
import { getDbInstance } from "../db.js";

export const secretKey = getSecretKey();
export const db = await getDbInstance();

export async function handleResetPassword(req, res) {
  if (!req.body.email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const user = await getUserByEmail(db, req.body.email);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const token = await generateToken(
    { user: { id: user.id, email: user.email } },
    secretKey,
    "1h"
  );

  //TODO: deshardcodear la URL
  const resetURL = `http://127.0.0.1:8080/change-password/?token=${token}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Reset your password",
    text: `Click on the following link to reset your password: ${resetURL}`,
  };
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });

  return res.status(200).json({ message: "Email sent." });
}
