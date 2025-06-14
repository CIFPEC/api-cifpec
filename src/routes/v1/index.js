import express from "express";
import auth from "./auth.js";
import courses from "./courses.js";
import categories from "./categories.js";
import batches from "./batches.js";
import user from "./user.js";
import users from "./users.js";
import projects from "./projects.js";
import sites from "./sites.js";
import roles from "./roles.js";
import dashboard from "./dashboard.js";
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
router.use("/categories",categories);
router.use("/batches",batches);
router.use("/user", user);
router.use("/users", users);
router.use("/projects", projects);
router.use("/site", sites);
router.use("/roles", roles);
router.use("/dashboard", dashboard);

export default router;