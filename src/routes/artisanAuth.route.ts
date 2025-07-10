import { Router } from 'express';
import * as artisanAuthController from '../controllers/artisanAuth.controller';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import {
  artisanRegisterSchema,
  artisanLoginSchema,
  artisanVerificationSchema,
  artisanLogoutSchema,
  artisanForgotPasswordSchema,
  artisanResetPasswordSchema,
  artisanRequestAccessTokenSchema
} from '../validation/auth.validation';

const router = Router();

// Artisan Authentication Routes
router.post('/register', validateRequest(artisanRegisterSchema), artisanAuthController.registerArtisan);

router.post('/verify/:artisanId', validateRequest(artisanVerificationSchema), artisanAuthController.verifyArtisan);

router.post('/resend-token/:artisanId', artisanAuthController.resendVerificationTokenArtisan);

router.post('/login', validateRequest(artisanLoginSchema), artisanAuthController.loginArtisan);

router.post('/logout', validateRequest(artisanLogoutSchema), artisanAuthController.logoutArtisan);

router.post('/forgot-password', validateRequest(artisanForgotPasswordSchema), artisanAuthController.forgotPasswordArtisan);

router.post('/reset-password', validateRequest(artisanResetPasswordSchema), artisanAuthController.resetPasswordArtisan);

router.post('/refresh-token', validateRequest(artisanRequestAccessTokenSchema), artisanAuthController.requestAccessTokenArtisan);

// OAuth Routes
router.get('/google', (req, res) => {
  // This will be handled by passport middleware
  res.redirect('/auth/google');
});

router.get('/google/callback', artisanAuthController.googleCallback);

export default router; 