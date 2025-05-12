import { ErrorHandler } from "../exceptions/errorHandler.js";
import fs from "fs/promises";

export default function checkUploads(fieldName = [],func) {
  // check if parameter fieldName is array
  if(fieldName && !Array.isArray(fieldName)){
    console.log("ERROR: ", "Parameter fieldName must be an array");
    throw new ErrorHandler(500, "Internal Server Error");
  }

  // filter files.fieldname in fieldName
  return async (req,res,next) => {
    const files = req.files;
    if(files && files.length > 0 && fieldName.length > 0) {
      /** 
       * collect all file want to remove
       * unlink files before remove
       * remove files.fieldname not in fieldName 
      */
      const removeFiles = [];
      for (const file of files) {
        if (!fieldName.includes(file.fieldname)) {
          removeFiles.push(file);
        }
      }
      for (const file of removeFiles) {
        await fs.unlink(file.path);
      }
      req.files = files.filter(file => fieldName.includes(file.fieldname));
    }

    // check if parameter func is function
    if (typeof func !== "function") {
      console.log("ERROR: ", "Parameter func must be a function");
      throw new ErrorHandler(500, "Internal Server Error");
    }

    func(req,res,next);
  }
}