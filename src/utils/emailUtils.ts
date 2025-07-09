import nodemailer from 'nodemailer';
import { getEnv } from './get-env';

const transporter = nodemailer.createTransport({
  host: getEnv('SMTP_HOST'),
  port: parseInt(getEnv('SMTP_PORT')),
  secure: getEnv('SMTP_SECURE') === 'true',
  auth: {
    user: getEnv('SMTP_USER'),
    pass: getEnv('SMTP_PASS'),
  },
});

interface SendMailParams {
  email: string;
  subject: string;
  text: string;
}

export const sendMail = async ({ email, subject, text }: SendMailParams) => {
  try {
    await transporter.sendMail({
      from: getEnv('SMTP_FROM'),
      to: email,
      subject,
      text,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
};

export default sendMail; 