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
    req.user = decoded;
  });
  next();
}

export function isAdmin(req, res, next) {
  // check if user is admin
  if (req.user.roleName !== "admin") {
    return next(new ErrorHandler(403, "Forbidden",[
      { header: "Authorization", message: "You are not admin" },
      { header: "Authorization", message: "Only admin can access" },
    ]));
  }
  next();
}
export function isStudent(req, res, next) {
  // check if user is student
  if (req.user.roleName !== "student") {
    return next(new ErrorHandler(403, "Forbidden",[
      { header: "Authorization", message: "You are not student" },
      { header: "Authorization", message: "Only student can access" },
    ]));
  }
  next();
}

export function isWebMaintenance(req, res, next) {
  // check if user is Web Maintenance
  if (req.user.roleName !== "web maintenance") {
    return next(new ErrorHandler(403, "Forbidden",[
      { header: "Authorization", message: "You are not Web Maintenance" },
      { header: "Authorization", message: "Only Web Maintenance can access" },
    ]));
  }
  next();
}

export function customMiddleware(roles=[]) {
  return function (req, res, next){
    // check if user role is in roles
    if (!roles.includes(req.user.roleName)) {
      return next(new ErrorHandler(403, "Forbidden",[
        { header: "Authorization", message: "You are not authorized" }
      ]));
    }
    next();
  }
}