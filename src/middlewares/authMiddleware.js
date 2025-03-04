import { ErrorHandler } from "./../exceptions/errorHandler.js";
import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const accessToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!accessToken) {
    return next(new ErrorHandler(401, "Unauthorized",[
      { header: "Authorization", message: "Required token" }
    ]));
  }
  jwt.verify(accessToken, process.env.ACCESS_KEY, function(err, decoded) {
    if (err) {
      return next(new ErrorHandler(401, "Unauthorized",[
        { header: "Authorization", message: "Invalid token" }
      ]));
    }
    req.user = {
      userId:decoded.userId,
      userEmail:decoded.userEmail,
      roleId:decoded.roleId,
      roleName:decoded.roleName
    };
  });
  next();
}