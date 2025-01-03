import express from "express";
import v1 from "./v1/index.js";
import v2 from "./v2/index.js";

const router = express.Router();

router.use("/api/v1",v1);
router.use("/api/v2",v2);

router.use("*",(req,res)=>{
  res.status(404).json({
    response:false,
    statusCode:404,
    message:"Not Found",
    errors:[]
  });
});

export default router;