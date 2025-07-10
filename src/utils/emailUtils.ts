import nodemailer from 'nodemailer';
import { getEnv } from './get-env';
import { SendMailParams } from '../@types/email.types';

// Create a test account if SMTP settings are not provided
const createTestAccount = async () => {
  console.warn('⚠️ SMTP settings not found, using Ethereal Email test account');
  const testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
};

// Get SMTP config with fallback to test account
const getEmailConfig = async () => {
  try {
    const smtpHost = getEnv('SMTP_HOST', '');
    const smtpPort = parseInt(getEnv('SMTP_PORT', '587'));
    const smtpSecure = getEnv('SMTP_SECURE', 'false') === 'true';
    const smtpUser = getEnv('SMTP_USER', '');
    const smtpPass = getEnv('SMTP_PASS', '');

    if (!smtpHost || !smtpUser || !smtpPass) {
      return await createTestAccount();
    }

    return {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };
  } catch (error) {
    return await createTestAccount();
  }
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (!transporter) {
    const config = await getEmailConfig();
    transporter = nodemailer.createTransport(config);
  }
  return transporter;
};

export const sendMail = async ({ email, subject, text }: SendMailParams) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: getEnv('SMTP_FROM', 'noreply@homieapp.com'),
      to: email,
      subject,
      text,
    });

    // If using test account, log the preview URL
    if (info.messageId && info.preview) {
      console.info('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
};

export default sendMail; 