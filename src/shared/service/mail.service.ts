import { env } from "../../config/env.config";
import transporter from "../../config/mail";
import Logger from "../../utils/logge.util";


const logger = new Logger("MailService");

export const sendMail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  try {
    const sendMail = await transporter.sendMail({
      from: env.EMAIL_USER,
      to,
      subject,
      html
    });
    logger.info(`Email sent to ${to} with subject "${subject}"`, { messageId: sendMail.messageId });
  } catch (error) {
    logger.error("Error sending email", error);
  }
}
