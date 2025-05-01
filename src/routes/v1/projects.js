import express from 'express';
import { authMiddleware } from './../../middlewares/authMiddleware.js';
import { validateBody } from './../../validations/validation.js';
import { createProject } from './../../controllers/projectController.js';
import { createProjectSchema } from './../../validations/projectValidations.js';
const router = express.Router();

/**
 * ========
 * PROJECTS
 * --------
 * - Create Project
 * - Get all students in project (not final) - in user,js
 * - Update Project - in user.js
 * - Get all projects in batch
 * - Get project in batch by ID
 * - Get all projects (Archived)
 * - Get project by ID (Archived)
 */

// Create Project
router.post("/",validateBody(createProjectSchema), authMiddleware, createProject);

export default router;