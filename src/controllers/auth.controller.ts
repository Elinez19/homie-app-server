import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as oauthService from '../services/oauth.service';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { getEnv } from '../utils/get-env';
import jwtUtils from '../utils/jwtUtils';
import { PrismaClient } from '../generated/prisma';
import { HTTPSTATUS } from '../config/http.config';

const prisma = new PrismaClient();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(HTTPSTATUS.CREATED).json(result);
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyUser({
    userId: req.params.userId,
    code: req.body.code
  });
  res.status(HTTPSTATUS.OK).json(result);
});

export const resendVerificationCode = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendVerificationCode(req.params.userId);
  res.status(HTTPSTATUS.OK).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password
  });
  res.status(HTTPSTATUS.OK).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logout(req.body.refreshToken);
  res.status(HTTPSTATUS.OK).json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(HTTPSTATUS.OK).json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword({
    token: req.body.token,
    password: req.body.password
  });
  res.status(HTTPSTATUS.OK).json(result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.status(HTTPSTATUS.OK).json(result);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${getEnv('FRONTEND_URL')}/auth/login?error=Google authentication failed`);
  }

  try {
    // Process OAuth callback
    const result = await oauthService.processOAuthCallback({ user: req.user });

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${getEnv('FRONTEND_URL')}/auth/google/callback`);
    redirectUrl.searchParams.append('accessToken', result.tokens!.accessToken);
    redirectUrl.searchParams.append('refreshToken', result.tokens!.refreshToken);
    
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    return res.redirect(`${getEnv('FRONTEND_URL')}/auth/login?error=Failed to generate tokens`);
  }
});
