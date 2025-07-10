import {
  VerificationCodeParams,
  SuccessfulVerificationParams,
  ForgotPasswordParams,
  PasswordChangeSuccessParams
} from '../@types/email.types';

export const getEmailTemplates = {
  verificationCode: ({ verificationCode }: VerificationCodeParams) => `
    Hello!

    Your verification code is: ${verificationCode}

    This code will expire in 10 minutes.

    If you didn't request this code, please ignore this email.
  `,

  successfulVerification: ({ loginUrl }: SuccessfulVerificationParams) => `
    Congratulations!

    Your email has been successfully verified. You can now log in to your account.

    Login here: ${loginUrl}
  `,

  forgotPassword: ({ resetPasswordUrl, fullName }: ForgotPasswordParams) => `
    Hello ${fullName},

    You recently requested to reset your password. Click the link below to reset it:

    ${resetPasswordUrl}

    This link will expire in 10 minutes.

    If you didn't request this, please ignore this email.
  `,

  passwordChangeSuccess: ({ loginUrl, fullName }: PasswordChangeSuccessParams) => `
    Hello ${fullName},

    Your password has been successfully changed.

    You can now login with your new password here: ${loginUrl}

    If you didn't make this change, please contact support immediately.
  `,
};

export default getEmailTemplates; 