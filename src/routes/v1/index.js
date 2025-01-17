import express from "express";
import auth from "./auth.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: "API v1"
   });
});

router.use("/auth",auth);

export default router;