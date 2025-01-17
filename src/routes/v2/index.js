import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({
      statusCode: 200,
      message: "API v2"
    });
});

export default router;