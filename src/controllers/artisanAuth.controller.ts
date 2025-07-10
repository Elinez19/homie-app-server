import { Request, Response } from 'express';
import * as artisanAuthService from '../services/artisanAuth.service';
import * as oauthService from '../services/oauth.service';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { getEnv } from '../utils/get-env';
import { HTTPSTATUS } from '../config/http.config';

export const registerArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.registerArtisan(req.body);
  res.status(HTTPSTATUS.CREATED).json(result);
});

export const verifyArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.verifyArtisan({
    artisanId: req.params.artisanId,
    code: req.body.code
  });
  res.json(result);
});

export const resendVerificationTokenArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.resendVerificationTokenArtisan(req.params.artisanId);
  res.json(result);
});

export const loginArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.loginArtisan({
    email: req.body.email,
    password: req.body.password
  });
  res.json(result);
});

export const logoutArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.logoutArtisan(req.body.refreshToken);
  res.json(result);
});

export const forgotPasswordArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.forgotPasswordArtisan(req.body.email);
  res.json(result);
});

export const resetPasswordArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.resetPasswordArtisan({
    token: req.body.token,
    password: req.body.newPassword
  });
  res.json(result);
});

export const requestAccessTokenArtisan = asyncHandler(async (req: Request, res: Response) => {
  const result = await artisanAuthService.requestAccessTokenArtisan(req.body.refreshToken);
  res.json(result);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${getEnv('FRONTEND_URL')}/artisan-auth/login?error=Google authentication failed`);
  }

  try {
    // Process OAuth callback for artisan
    const result = await oauthService.processOAuthCallback({ 
      user: req.user, 
      role: 'ARTISAN' 
    });

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${getEnv('FRONTEND_URL')}/artisan-auth/google/callback`);
    redirectUrl.searchParams.append('accessToken', result.tokens!.accessToken);
    redirectUrl.searchParams.append('refreshToken', result.tokens!.refreshToken);
    
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    return res.redirect(`${getEnv('FRONTEND_URL')}/artisan-auth/login?error=Failed to generate tokens`);
  }
}); 