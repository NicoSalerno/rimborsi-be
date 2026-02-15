import nodemailer from "nodemailer";
import crypto from "crypto";
import { transporter } from "./verification.entity";
import "dotenv/config";
import { verficationModel } from "./verification.model";

export class VerficationService {
  async sendEmailVerification(username: string) {
    //console.log("MAIL_USER:", process.env.MAIL_USER);
    //console.log("MAIL_PASS:", process.env.MAIL_PASS?.slice(0, 4) + "****");
    const verificationUrl = `http://localhost:3000/api/verify-email?username=${username}`;

    await transporter.sendMail({
      from: `"posta" <${process.env.MAIL_USER}>`,
      to: username,
      subject: "Verify your account",
      html: `
      <h2>Verify your email</h2>
      <p>Hey ${username}, Click the button below to verify your account:</p>
      <a href="${verificationUrl}" 
         style="display:inline-block;padding:10px 20px;background:#0d6efd;color:white;text-decoration:none;border-radius:4px;">
         Verify Email
      </a>
    `,
    });
    await verficationModel.create({
      username: username,
      createdAt: Date.now(),
      validated: false,
    });
  }
}

export default new VerficationService();
