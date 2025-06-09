import "dotenv/config";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "./../exceptions/errorHandler.js";

export function checkToken(req, res, next) {
  // get bearer token from header
  const verifyToken = req.headers["verify-token"];

  if (!verifyToken) {
    return next(new ErrorHandler(401, "Verify Token is required"));
  }

  // verify jwt token
  try {
    const verify = jwt.verify(verifyToken, process.env.VERIFY_KEY);
    req.user = {
      userId:verify.userId,
      userEmail:verify.userEmail
    };
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or expired token"));
  }
  next();
}
