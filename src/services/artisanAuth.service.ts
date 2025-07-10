import { UserRole, UserStatus } from '../generated/prisma';
import { prisma } from '../config/database.config';
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
import {
  ArtisanRegisterParams,
  ArtisanLoginParams,
  ArtisanVerifyParams,
  ResetPasswordParams,
  ArtisanAuthResponse
} from '../@types/artisanAuth.types';

export const registerArtisan = async (params: ArtisanRegisterParams) => {
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
        role: UserRole.ARTISAN,
        status: UserStatus.PENDING,
        address: params.address,
        city: params.city,
        state: params.state,
        zipCode: params.zipCode,
        artisan: {
          create: {
            businessName: params.businessName,
            businessLicense: params.businessLicense,
            taxId: params.taxId,
            serviceCategories: params.serviceCategories,
            serviceAreas: params.serviceAreas,
            description: params.description,
            hourlyRate: params.hourlyRate,
            yearsOfExperience: params.yearsOfExperience,
            qualifications: params.qualifications || [],
            insuranceInfo: params.insuranceInfo,
            workingHours: params.workingHours,
            maxJobDistance: params.maxJobDistance || 50
          }
        }
      },
      include: {
        artisan: true
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
        subject: 'Verify Your Artisan Account',
        text: emailContent
      });

      return {
        success: true,
        message: 'Artisan registered successfully. Please verify your email using the code sent to your email.',
        data: { 
          id: newUser.id, 
          email: newUser.email,
          artisanId: newUser.artisan?.id
        }
      };
    } catch (emailError: any) {
      await cleanupTokensAfterFailedEmailMessage({ id: newUser.id });
      throw new Error(`Error sending verification email: ${emailError.message}`);
    }
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
};

export const verifyArtisan = async ({ artisanId, code }: ArtisanVerifyParams) => {
  try {
    const artisan = await prisma.artisan.findUnique({
      where: { id: artisanId },
      include: { user: true }
    });

    if (!artisan) {
      throw new Error('Artisan not found');
    }

    const authToken = await prisma.authToken.findFirst({
      where: {
        userId: artisan.userId,
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
      where: { id: artisan.userId },
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
      subject: 'Artisan Account Verification Successful',
      text: emailContent
    });

    return {
      success: true,
      message: 'Artisan account successfully verified',
      data: null
    };
  } catch (error: any) {
    throw new Error(`Error verifying artisan: ${error.message}`);
  }
};

export const resendVerificationTokenArtisan = async (artisanId: string) => {
  try {
    const artisan = await prisma.artisan.findUnique({
      where: { id: artisanId },
      include: { user: true }
    });

    if (!artisan) {
      throw new Error('Artisan not found');
    }

    await prisma.authToken.deleteMany({
      where: { userId: artisan.userId }
    });

    const verificationCode = generateVerificationCode(VERIFICATION_CODE_LENGTH);
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

    await prisma.authToken.create({
      data: {
        userId: artisan.userId,
        authCode: hashedVerificationCode,
        expiresAt: calculateExpiryTime(VERIFICATION_EXPIRY_MINUTES)
      }
    });

    const emailContent = getEmailTemplates.verificationCode({
      verificationCode
    });

    await sendMail({
      email: artisan.user.email,
      subject: 'Verify Your Artisan Account',
      text: emailContent
    });

    return {
      success: true,
      message: 'Verification code resent successfully',
      data: {
        id: artisan.user.id,
        email: artisan.user.email,
        artisanId: artisan.id
      }
    };
  } catch (error: any) {
    throw new Error(`Error resending verification code: ${error.message}`);
  }
};

export const loginArtisan = async ({ email, password }: ArtisanLoginParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { artisan: true }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.role !== UserRole.ARTISAN) {
      throw new Error('This account is not registered as an artisan');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is not active. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = jwtUtils.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return {
      success: true,
      message: 'Artisan logged in successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          artisan: user.artisan
        }
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  } catch (error: any) {
    throw new Error(`Error logging in artisan: ${error.message}`);
  }
};

export const logoutArtisan = async (refreshToken: string) => {
  try {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });

    return {
      success: true,
      message: 'Artisan logged out successfully'
    };
  } catch (error: any) {
    throw new Error(`Error logging out artisan: ${error.message}`);
  }
};

export const forgotPasswordArtisan = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { artisan: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.ARTISAN) {
      throw new Error('This account is not registered as an artisan');
    }

    const resetToken = jwtUtils.generateResetToken(user.email);

    const emailContent = getEmailTemplates.forgotPassword({
      resetPasswordUrl: `${process.env.FRONTEND_URL || 'http://localhost:5713'}/reset-password?token=${resetToken}`,
      fullName: `${user.firstName} ${user.lastName}`
    });

    await sendMail({
      email: user.email,
      subject: 'Reset Your Artisan Account Password',
      text: emailContent
    });

    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  } catch (error: any) {
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

export const resetPasswordArtisan = async ({ token, password }: ResetPasswordParams) => {
  try {
    const decoded = jwtUtils.verifyToken(token) as { email: string };
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { artisan: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.ARTISAN) {
      throw new Error('This account is not registered as an artisan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });

    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error: any) {
    throw new Error(`Error resetting password: ${error.message}`);
  }
};

export const requestAccessTokenArtisan = async (refreshToken: string) => {
  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { artisan: true } } }
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id }
      });
      throw new Error('Refresh token expired');
    }

    if (tokenRecord.user.role !== UserRole.ARTISAN) {
      throw new Error('This account is not registered as an artisan');
    }

    const { accessToken } = jwtUtils.generateTokens({
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role
    });

    return {
      success: true,
      message: 'Access token generated successfully',
      data: {
        user: {
          id: tokenRecord.user.id,
          email: tokenRecord.user.email,
          firstName: tokenRecord.user.firstName,
          lastName: tokenRecord.user.lastName,
          role: tokenRecord.user.role,
          artisan: tokenRecord.user.artisan
        }
      },
      tokens: {
        accessToken
      }
    };
  } catch (error: any) {
    throw new Error(`Error generating access token: ${error.message}`);
  }
}; 