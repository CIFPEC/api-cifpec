import express from 'express';
import { authMiddleware, customMiddleware, isAdmin } from './../../middlewares/authMiddleware.js';
import { getAllLecturer, getAllStudent, updateLecturer } from './../../controllers/userController.js';
import { validateBody } from './../../validations/validation.js';
import { updateLecturerSchema } from './../../validations/auth/userValidations.js';
const router = express.Router();

/**
 * ========
 * USERS
 * --------
 * - Get all users (current batch)
 * - Get all lecturer (current batch)
 * - Update Lecturer by ID (Admin Only)
 * - Get all students (All Courses)
 * - Get all students (in batch and course) - in batch route
 */

router.get("/lecturers", authMiddleware, customMiddleware({include: ["admin", "student"]}), getAllLecturer);
router.patch("/:userId/lecturers", authMiddleware, customMiddleware({exclude: ["student"]}) , validateBody(updateLecturerSchema), updateLecturer);
router.get("/students", authMiddleware, getAllStudent);

export default router;