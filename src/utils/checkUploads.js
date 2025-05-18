import { ErrorHandler } from "../exceptions/errorHandler.js";
import fs from "fs/promises";

export default function checkUploads(fieldName = [], func = null, normalizeField = null) {
  // filter files.fieldname in fieldName
  return async (req,res,next) => {
    let allowedFields = fieldName;

    if (typeof fieldName === 'function') {
      allowedFields = fieldName(req) || [];
    }

    if (allowedFields && !Array.isArray(allowedFields)) {
      console.log("ERROR: ", "Parameter fieldName must be an array");
      throw new ErrorHandler(500, "Internal Server Error");
    }

    const files = req.files;
    if(files && files.length > 0 && allowedFields.length > 0) {
      /** 
       * collect all file want to remove
       * unlink files before remove
       * remove files.fieldname not in fieldName 
      */
      const removeFiles = [];
      
      for (const file of files) {
        const cleaned = normalizeField
          ? normalizeField(file.fieldname)
          : file.fieldname;

        if (!allowedFields.includes(cleaned)) {
          removeFiles.push(file);
        }
      }

      for (const file of removeFiles) {
        await fs.unlink(file.path);
      }

      req.files = files.filter(file => {
        const cleaned = normalizeField
          ? normalizeField(file.fieldname)
          : file.fieldname;

        return allowedFields.includes(cleaned);
      });
    }

    // check if parameter func is function
    if (func && typeof func === "function") {
      return func(req, res, next);
    }

    next();
  };
}