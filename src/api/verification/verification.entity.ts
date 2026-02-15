import nodemailer from "nodemailer";
import 'dotenv/config';

export type Verification = {
  username: string;
  createdAt: string;
  validated: boolean;
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
