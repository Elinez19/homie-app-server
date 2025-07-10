export interface SendMailParams {
  email: string;
  subject: string;
  text: string;
}

export interface VerificationCodeParams {
  verificationCode: string;
}

export interface SuccessfulVerificationParams {
  loginUrl: string;
}

export interface ForgotPasswordParams {
  resetPasswordUrl: string;
  fullName: string;
}

export interface PasswordChangeSuccessParams {
  loginUrl: string;
  fullName: string;
} 