import { PrismaClient } from '../generated/prisma';
import { User, UserRole, UserStatus } from '../generated/prisma';
import bcrypt from 'bcrypt';
import jwtUtils from '../utils/jwtUtils';
import sendMail from '../utils/emailUtils';
import { cleanupTokensAfterFailedEmailMessage } from '../helpers/cleanUpExpiredUser';
import { getEmailTemplates } from '../helpers/emailContents';
import {
  VERIFICATION_CODE_LENGTH,
  VERIFICATION_EXPIRY_MINUTES,
  calculateExpiryTime,
  generateVerificationCode,
} from '../utils/functions';

const prisma = new PrismaClient();

interface RegisterUserParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

interface VerifyUserParams {
  userId: string;
  code: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface ResetPasswordParams {
  token: string;
  password: string;
}

export const registerUser = async (params: RegisterUserParams) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: params.email.toLowerCase() }
    });

    if (existingUser) {
      const existingToken = await prisma.authToken.findFirst({
        where: {
          userId: existingUser.id,
          expiresAt: { gt: new Date() }
        }
      });

      if (existingToken) {
        throw new Error('A valid verification code already exists. Please use it or wait for it to expire.');
      }
      throw new Error('User with this email already exists. Please login or use a different email.');
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: params.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: params.firstName,
        lastName: params.lastName,
        phoneNumber: params.phoneNumber,
        role: params.role || UserRole.CUSTOMER,
        status: UserStatus.PENDING
      }
    });

    try {
      const verificationCode = generateVerificationCode(VERIFICATION_CODE_LENGTH);
      const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

      await prisma.authToken.create({
        data: {
          userId: newUser.id,
          authCode: hashedVerificationCode,
          expiresAt: calculateExpiryTime(VERIFICATION_EXPIRY_MINUTES)
        }
      });

      const emailContent = getEmailTemplates.verificationCode({
        verificationCode
      });

      await sendMail({
        email: newUser.email,
        subject: 'Verify Your Email',
        text: emailContent
      });

      return {
        success: true,
        message: 'User registered successfully. Please verify your email using the code sent to your email.',
        data: { id: newUser.id, email: newUser.email }
      };
    } catch (emailError: any) {
      await cleanupTokensAfterFailedEmailMessage({ id: newUser.id });
      throw new Error(`Error sending verification email: ${emailError.message}`);
    }
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
};

export const verifyUser = async ({ userId, code }: VerifyUserParams) => {
  try {
    const authToken = await prisma.authToken.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() }
      }
    });

    if (!authToken) {
      throw new Error('Verification code is expired or invalid');
    }

    const isCodeValid = await bcrypt.compare(code, authToken.authCode);
    if (!isCodeValid) {
      throw new Error('Invalid verification code');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        status: UserStatus.ACTIVE
      }
    });

    await prisma.authToken.delete({
      where: { id: authToken.id }
    });

    const emailContent = getEmailTemplates.successfulVerification({
      loginUrl: process.env.FRONTEND_URL || 'http://localhost:5713'
    });

    await sendMail({
      email: user.email,
      subject: 'Email Verification Successful',
      text: emailContent
    });

    return {
      success: true,
      message: 'Email successfully verified',
      data: null
    };
  } catch (error: any) {
    throw new Error(`Error verifying user: ${error.message}`);
  }
};

export const resendVerificationCode = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.authToken.deleteMany({
      where: { userId }
    });

    const verificationCode = generateVerificationCode(VERIFICATION_CODE_LENGTH);
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

    await prisma.authToken.create({
      data: {
        userId,
        authCode: hashedVerificationCode,
        expiresAt: calculateExpiryTime(VERIFICATION_EXPIRY_MINUTES)
      }
    });

    const emailContent = getEmailTemplates.verificationCode({
      verificationCode
    });

    await sendMail({
      email: user.email,
      subject: 'Verify Your Email',
      text: emailContent
    });

    return {
      success: true,
      message: 'Verification code resent successfully',
      data: { id: user.id, email: user.email }
    };
  } catch (error: any) {
    throw new Error(`Error resending verification code: ${error.message}`);
  }
};

export const login = async ({ email, password }: LoginParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      throw new Error('Your account has been suspended or banned');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokens = jwtUtils.generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return {
      success: true,
      message: 'Login successful',
      data: tokens
    };
  } catch (error: any) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

export const logout = async (refreshToken: string) => {
  try {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });

    return {
      success: true,
      message: 'Logged out successfully',
      data: null
    };
  } catch (error: any) {
    throw new Error(`Error logging out: ${error.message}`);
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingToken = await prisma.authToken.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingToken) {
      throw new Error('A password reset link has already been sent. Please check your email or wait for it to expire.');
    }

    const resetToken = jwtUtils.generateResetToken(user);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailContent = getEmailTemplates.forgotPassword({
      resetPasswordUrl: resetUrl,
      fullName: `${user.firstName} ${user.lastName}`
    });

    await prisma.authToken.create({
      data: {
        userId: user.id,
        authCode: resetToken,
        expiresAt: calculateExpiryTime(10) // 10 minutes
      }
    });

    await sendMail({
      email: user.email,
      subject: 'Password Reset Request',
      text: emailContent
    });

    return {
      success: true,
      message: 'Password reset instructions sent to your email',
      data: null
    };
  } catch (error: any) {
    throw new Error(`Error processing forgot password request: ${error.message}`);
  }
};

export const resetPassword = async ({ token, password }: ResetPasswordParams) => {
  try {
    const decoded = jwtUtils.verifyToken(token) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });

    await prisma.authToken.deleteMany({
      where: { userId: user.id }
    });

    const emailContent = getEmailTemplates.passwordChangeSuccess({
      loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      fullName: `${user.firstName} ${user.lastName}`
    });

    await sendMail({
      email: user.email,
      subject: 'Password Changed Successfully',
      text: emailContent
    });

    return {
      success: true,
      message: 'Password reset successful',
      data: null
    };
  } catch (error: any) {
    throw new Error(`Error resetting password: ${error.message}`);
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!existingToken) {
      throw new Error('Invalid refresh token');
    }

    const decoded = jwtUtils.verifyRefreshToken(refreshToken) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const tokens = jwtUtils.generateTokens(user);

    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return {
      success: true,
      message: 'Access token refreshed successfully',
      data: tokens
    };
  } catch (error: any) {
    throw new Error(`Error refreshing access token: ${error.message}`);
  }
};
