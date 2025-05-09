import express from 'express';
import { siteUpdate } from './../../controllers/siteController.js';
import { validateBody } from './../../validations/validation.js';
import { updateSiteSchema } from './../../validations/siteValidations.js';
const router = express.Router();

/**
 * ========
 * SITE MAINTENANCE
 * --------
 * - Site update
 */

router.patch("/settings",validateBody(updateSiteSchema), siteUpdate);

export default router;