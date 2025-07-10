import { Router } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  fetchAdmin,
  requestAccessToken,
  createSubAdmin,
  updateSubAdmin,
  toggleSuspendAdmin,
  deleteSubAdmin,
  fetchAllUsers,
  fetchSingleUser,
  toggleSuspendAccount
} from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import {
  adminLoginSchema,
  adminRegisterSchema,
  adminUpdateSchema,
  adminLogoutSchema,
  requestAccessTokenSchema,
  toggleSuspendSchema
} from '../validation/admin.validation';

const router = Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Authentication]
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
router.post('/login', validateRequest(adminLoginSchema), loginAdmin);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Authentication]
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
 */
router.post('/logout', adminAuthMiddleware, validateRequest(adminLogoutSchema), logoutAdmin);

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', adminAuthMiddleware, fetchAdmin);

/**
 * @swagger
 * /admin/refresh-token:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Authentication]
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
router.post('/refresh-token', validateRequest(requestAccessTokenSchema), requestAccessToken);

// Sub-admin management routes
/**
 * @swagger
 * /admin/register-admin:
 *   post:
 *     summary: Create a new sub-admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
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
 *         description: Sub-admin created successfully
 */
router.post('/register-admin', adminAuthMiddleware, validateRequest(adminRegisterSchema), createSubAdmin);

/**
 * @swagger
 * /admin/update-admin/{adminId}:
 *   put:
 *     summary: Update sub-admin details
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 */
router.put('/update-admin/:adminId', adminAuthMiddleware, validateRequest(adminUpdateSchema), updateSubAdmin);

/**
 * @swagger
 * /admin/toggle-suspend/{adminId}:
 *   put:
 *     summary: Toggle admin suspension
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [suspend, activate]
 *     responses:
 *       200:
 *         description: Admin suspension toggled successfully
 */
router.put('/toggle-suspend/:adminId', adminAuthMiddleware, validateRequest(toggleSuspendSchema), toggleSuspendAdmin);

/**
 * @swagger
 * /admin/delete-admin/{adminId}:
 *   delete:
 *     summary: Delete sub-admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sub-admin deleted successfully
 */
router.delete('/delete-admin/:adminId', adminAuthMiddleware, deleteSubAdmin);

// User management routes
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', adminAuthMiddleware, fetchAllUsers);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get single user details
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get('/users/:userId', adminAuthMiddleware, fetchSingleUser);

/**
 * @swagger
 * /admin/users/toggle-suspend/{userId}:
 *   put:
 *     summary: Toggle user account suspension
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [suspend, activate]
 *     responses:
 *       200:
 *         description: User suspension toggled successfully
 */
router.put('/users/toggle-suspend/:userId', adminAuthMiddleware, validateRequest(toggleSuspendSchema), toggleSuspendAccount);

export default router; 