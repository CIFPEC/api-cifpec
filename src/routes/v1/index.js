import express from "express";
import auth from "./auth.js";
import courses from "./courses.js";
import batches from "./batches.js";
import { renewToken } from "./../../controllers/authController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: "API v1"
   });
});

router.use("/auth",auth);
router.get("/token",renewToken);
router.use("/courses",courses);
router.use("/batches",batches);

export default router;