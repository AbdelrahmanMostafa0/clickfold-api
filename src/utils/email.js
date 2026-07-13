import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  return resend.emails.send({
    from: "LinkPulse <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};
