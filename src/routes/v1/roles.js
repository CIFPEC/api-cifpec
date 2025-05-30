import express from 'express';
import { getAllRoles } from '../../controllers/roleController.js';
const router = express.Router();

/**
 * ========
 * ROLES
 * --------
 * - get roles
 */

// get roles
router.get("/", getAllRoles);

export default router;