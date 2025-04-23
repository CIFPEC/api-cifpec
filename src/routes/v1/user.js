import express from 'express';
import { getCurrentUser, updateCurrentUser, updateCurrentUserPassword } from '../../controllers/currentUserController.js';
import { authMiddleware } from './../../middlewares/authMiddleware.js';
import { validateBody } from './../../validations/validation.js';
import { requestCodeSchema, updateCurrentUserPasswordSchema, updateCurrentUserSchema, verifySchema } from './../../validations/auth/userValidations.js';
import { requestCodeVerifyEmail, verifyEmail } from './../../controllers/authController.js';
import { updateProject } from '../../controllers/projectController.js';
const router = express.Router();

/**
 * ========
 * CURRENT USERS
 * --------
 * - Get Current User
 * - Update Current User
 * - Update Current User Password
 * - User Verify Email (Request Code)
 * - User Verify Email (Verify Code)
 */

// Get Current User
router.get("/profile",authMiddleware, getCurrentUser);
router.patch("/profile",validateBody(updateCurrentUserSchema),authMiddleware, updateCurrentUser);
router.patch("/profile/password",validateBody(updateCurrentUserPasswordSchema),authMiddleware, updateCurrentUserPassword);
router.post("/profile/email/verify/request",validateBody(requestCodeSchema),authMiddleware, requestCodeVerifyEmail);
router.post("/profile/email/verify",validateBody(verifySchema), verifyEmail);

// Update Project
router.patch("/projects/:projectId", authMiddleware, updateProject);
export default router;