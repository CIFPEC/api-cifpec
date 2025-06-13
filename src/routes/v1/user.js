import express from 'express';
import { getCurrentUser, updateCurrentUser, updateCurrentUserPassword } from '../../controllers/currentUserController.js';
import { authMiddleware, isAdmin, isStudent } from './../../middlewares/authMiddleware.js';
import { validateBody } from './../../validations/validation.js';
import { requestCodeSchema, updateCurrentUserPasswordSchema, updateCurrentUserSchema, verifySchema } from './../../validations/auth/userValidations.js';
import { requestCodeVerifyEmail, verifyEmail } from './../../controllers/authController.js';
import { getAllProject, updateProject } from '../../controllers/projectController.js';
import { uploadFile } from './../../utils/uploader.js';
import checkUploads from './../../utils/checkUploads.js';
import resolveUploadFields from './../../middlewares/resolveUploadFields.js';
import { profileImage } from '../../middlewares/checkFileType.js';
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
router.patch("/profile" ,authMiddleware ,uploadFile("profile").any(),validateBody(updateCurrentUserSchema),  checkUploads(["userProfileImage"],profileImage), updateCurrentUser);
router.patch("/profile/password" ,authMiddleware ,validateBody(updateCurrentUserPasswordSchema), updateCurrentUserPassword);
router.post("/profile/email/verify/request" ,authMiddleware ,validateBody(requestCodeSchema) ,requestCodeVerifyEmail);
router.post("/profile/email/verify" ,authMiddleware, validateBody(verifySchema), verifyEmail);

// Get all student projects
router.get("/projects", authMiddleware, isStudent, getAllProject);
// Update Project
router.patch("/projects/:projectId", authMiddleware, isStudent, resolveUploadFields, uploadFile("project-files").any(), checkUploads(
  req => req.uploadFields, 
  null,
  (fieldname) => {
    const match = /^requirements\[(.+)\]$/.exec(fieldname);
    return match ? match[1] : fieldname;
  }
 ), updateProject);
export default router;