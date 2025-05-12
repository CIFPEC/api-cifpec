import express from 'express';
import { siteUpdate } from './../../controllers/siteController.js';
import { validateBody } from './../../validations/validation.js';
import { updateSiteSchema } from './../../validations/siteValidations.js';
import { uploadFile } from './../../utils/uploader.js';
import checkUploads from './../../utils/checkUploads.js';
import { siteSetting } from './../../middlewares/checkFileType.js';
import { authMiddleware, isWebMaintenance } from './../../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * ========
 * SITE MAINTENANCE
 * --------
 * - Site update
 */

router.patch("/settings", authMiddleware, isWebMaintenance, validateBody(updateSiteSchema),uploadFile("site-settings").any(), checkUploads(["logo","banner"],siteSetting), siteUpdate);

export default router;