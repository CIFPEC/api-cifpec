
import express from "express";
import { getDashboard } from "../../controllers/dashboardController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
const router = express.Router();

// NEW 
// Get dashboard data
router.get("/", authMiddleware, getDashboard);

export default router;
