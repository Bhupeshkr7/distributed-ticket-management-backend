import Logger from "../utils/logge.util";
import nodemailer from "nodemailer";
import { env } from "./env.config";

const logger = new Logger("MailConfig");

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD
  }
})
transporter.verify()
  .then(() => {
    logger.info("SMTP transporter is ready to send emails");
  })
  .catch((error) => {
    logger.error("Error verifying SMTP transporter", error);
  });

export default transporter;
