import express from 'express';
import { validateBody } from './../../validations/validation.js';
import { createBatch, getAllBatches, getBatchById, updateBatchById } from './../../controllers/batchController.js';
import { createAndUpdateBatchSchema } from './../../validations/batchValidations.js';
import { getStudentByBatchAndCourseService } from './../../services/userServices.js';
import { authMiddleware, isAdmin, isStudent } from '../../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * ========
 * BATCHES
 * --------
 * - Get all batches 
 * - get batch by id
 * - Create batch
 * - Update batch
 */

// Get all batches
router.get("/",getAllBatches);
// get batch by id
router.get("/:id" ,authMiddleware ,isAdmin,getBatchById);
// Create batch
router.post("/", authMiddleware, isAdmin,validateBody(createAndUpdateBatchSchema),createBatch);
// Update batch
router.patch("/:id", authMiddleware, isAdmin,validateBody(createAndUpdateBatchSchema),updateBatchById);

// Get all students (in batch and course)
router.get("/:batchId/courses/:courseId/students", authMiddleware, isStudent, getStudentByBatchAndCourseService);


export default router;