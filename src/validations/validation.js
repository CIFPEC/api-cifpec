import { ErrorHandler } from "./../exceptions/errorHandler.js";
export function middlewareError(err, req, res, next) {
  const { message = "Something went wrong", status = 500, errors = [] } = err;
  res.status(status).json({
    response: false,
    statusCode: status,
    message,
    errors
  });
}

export function sequelizeError(err, req, res, next) {
  if(
    err.name === "SequelizeError" ||
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError" ||
    err.name === "SequelizeForeignKeyConstraintError" ||
    err.name === "SequelizeCheckConstraintError" ||
    err.name === "SequelizeNotNullConstraintError" ||
    err.name === "SequelizeDataError" 
    // err.name === "SequelizeConnectionError" ||
    // err.name === "SequelizeConnectionRefusedError" ||
    // err.name === "SequelizeConnectionTimedOutError" ||
    // err.name === "SequelizeHostNotFoundError" ||
    // err.name === "SequelizeHostNotReachableError" ||
    // err.name === "SequelizeInvalidConnectionError" ||
    // err.name === "SequelizeConnectionAccessDeniedError" ||
    // err.name === "SequelizeConnectionTimeoutError" ||
    // err.name === "SequelizeError"  
  ){
    const errors = err.errors.map((error) => ({ field: error.path, message: error.message }));
    throw new ErrorHandler(500, "Internal Server Error", errors);
  }
  next(err);
}

export function validateBody(schema) {
  return function (req, res, next) {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((error) => ({
        field: error.context.key,
        message: error.message.replace(/"/g, ""),
      }));
      return next(new ErrorHandler(400, "Validation failed", errors));
    }
    next();
  };
}