import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API v2" });
});

export default router;