import express from 'express';
import { getCurrentUser, updateCurrentUser, updateCurrentUserPassword } from '../../controllers/currentUserController.js';
import { authMiddleware } from './../../middlewares/authMiddleware.js';
import { validateBody } from './../../validations/validation.js';
import { updateCurrentUserPasswordSchema, updateCurrentUserSchema } from '../../validations/auth/userValidations.js';
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

export default router;