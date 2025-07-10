import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import {
  registerUserSchema,
  loginSchema,
  userVerificationSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestAccessTokenSchema,
} from '../validation/auth.validation';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
// Register new user
router.post('/register', validateRequest(registerUserSchema), authController.register);

/**
 * @swagger
 * /auth/verify/{userId}:
 *   post:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid verification code
 */
// Verify user's email
router.post('/verify/:userId', validateRequest(userVerificationSchema), authController.verify);

/**
 * @swagger
 * /auth/verify/resend/{userId}:
 *   post:
 *     summary: Resend verification code
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification code resent successfully
 *       400:
 *         description: User not found
 */
// Resend verification code
router.post('/verify/resend/:userId', authController.resendVerificationCode);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
// Login
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Invalid token
 */
// Logout
router.post('/logout', validateRequest(logoutSchema), authController.logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: User not found
 */
// Forgot password
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
 */
// Reset password
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
// Refresh access token
router.post('/refresh-token', validateRequest(requestAccessTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login for customers
 *     tags: [Authentication]
 *     description: Redirects to Google OAuth for customer authentication
 *     responses:
 *       302:
 *         description: Redirect to Google login
 */
// Google OAuth routes for customers
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  state: 'customer' // Add state to identify customer OAuth
}));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     description: Handles the OAuth callback from Google
 *     responses:
 *       200:
 *         description: OAuth login successful
 *       400:
 *         description: OAuth login failed
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login?error=Google authentication failed',
    session: false
  }),
  authController.googleCallback
);

export default router;
