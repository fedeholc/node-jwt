import nodemailer from "nodemailer";
import process from "process";
import crypto from "crypto";
import { db, resetExpirationTime } from "../global-store.js";

/**
 * @param {import('express').Request & {session: import('express-session').Session & Partial<import('express-session').SessionData> & { resetCode?: string, resetCodeExpires?: number }}} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
export async function handleResetPass(req, res) {
  try {
    if (!req.body.email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await db.getUserByEmail(req.body.email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Reset your password",
      text: `Code: ${resetCode}`,
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
        return res.status(500).json({ error: "Failed to send email." });
      } else {
        console.log("Email sent: ", info.response);
      }
    });

    if (!req.session) {
      return res.status(500).json({ error: "Session error." });
    }
    req.session.resetCode = resetCode;
    req.session.resetCodeExpires = Date.now() + resetExpirationTime;

    return res.status(200).json({ message: "Email sent." });
  } catch (error) {
    console.error("Error in handleResetPass", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
