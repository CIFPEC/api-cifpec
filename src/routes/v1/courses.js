import express from 'express';
import { createCourses, destroyCourseById, getAllCourses, getCourseById, updateCourseById } from './../../controllers/courseController.js';
import { validateBody } from './../../validations/validation.js';
import { createCourseSchema, updateCourseSchema } from './../../validations/courseValidations.js';
import { authMiddleware, isAdmin } from '../../middlewares/authMiddleware.js';
const router = express.Router();


/** 
 * ======
 *  COURSES 
 * ======
 * - Get All Courses
 * - Get Course By Id
 * - Create Course
 * - Update Course
 * - Delete Course
 * **/

// Get All Courses
router.get("/",getAllCourses);

// Create Course
router.post("/" ,authMiddleware ,isAdmin ,validateBody(createCourseSchema)  ,createCourses);

// Get Course By Id
router.get("/:id" ,authMiddleware ,isAdmin ,getCourseById);

// Update Course
router.patch("/:id", authMiddleware, isAdmin, validateBody(updateCourseSchema),updateCourseById);

// Delete Course (Optional)
router.delete("/:id", authMiddleware, isAdmin, destroyCourseById);

export default router;