import express from 'express';
import { getCurrentUser } from '../../controllers/currentUserController.js';
import { authMiddleware } from './../../middlewares/authMiddleware.js';
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

export default router;