import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { getEnv } from '../utils/get-env';
import jwtUtils from '../utils/jwtUtils';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyUser({
    userId: req.params.userId,
    code: req.body.code
  });
  res.json(result);
});

export const resendVerificationCode = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendVerificationCode(req.params.userId);
  res.json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password
  });
  res.json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logout(req.body.refreshToken);
  res.json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword({
    token: req.body.token,
    password: req.body.password
  });
  res.json(result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.json(result);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${getEnv('FRONTEND_URL')}/auth/login?error=Google authentication failed`);
  }

  try {
    // Generate tokens
    const tokens = jwtUtils.generateTokens(req.user);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: req.user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${getEnv('FRONTEND_URL')}/auth/google/callback`);
    redirectUrl.searchParams.append('accessToken', tokens.accessToken);
    redirectUrl.searchParams.append('refreshToken', tokens.refreshToken);
    
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    return res.redirect(`${getEnv('FRONTEND_URL')}/auth/login?error=Failed to generate tokens`);
  }
});
