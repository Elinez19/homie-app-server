import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Register new user
router.post('/register', authController.register);

// Verify user's email
router.post('/verify/:userId', authController.verify);

// Resend verification code
router.post('/verify/resend/:userId', authController.resendVerificationCode);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Refresh access token
router.post('/refresh-token', authController.refreshToken);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login?error=Google authentication failed',
    session: false
  }),
  authController.googleCallback
);

export default router;
