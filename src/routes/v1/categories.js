import express from 'express';
import { createCategory, destroyCategoryById, getAllCategories, getCategoryById, updateCategoryById,  } from './../../controllers/categoryController.js';
import { validateBody } from './../../validations/validation.js';
import { authMiddleware, isAdmin } from '../../middlewares/authMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../../validations/categoryValidations.js';
const router = express.Router();


/** 
 * ======
 *  CATEGORIES 
 * ======
 * - Get All Categories
 * - Get Category By Id
 * - Create Cetegory
 * - Update Category
 * - Delete Category
 * **/

// Get All categories
router.get("/",getAllCategories);

// Create category
router.post("/" ,authMiddleware ,isAdmin ,validateBody(createCategorySchema)  ,createCategory);

// Get category By Id
router.get("/:id" ,getCategoryById);

// Update category
router.patch("/:id", authMiddleware, isAdmin, validateBody(updateCategorySchema),updateCategoryById);

// Delete category (Optional)
router.delete("/:id", authMiddleware, isAdmin, destroyCategoryById);

export default router;