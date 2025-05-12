import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { fileTypeFromBuffer } from 'file-type';
import { checkIfExists } from "./helper.js";

export function uploadFile(destination) {

  const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      const PathDestination = path.join(process.cwd(), "public", "uploads", destination);
      // check if directory exist
      try {
        const exist = await checkIfExists(PathDestination);
        if (!exist) {
          await fs.mkdir(PathDestination, { recursive: true });
        }
        cb(null, path.join(PathDestination));
      } catch (error) {
        console.log("UPLOAD FILE ERROR: ", error);
        throw new ErrorHandler(500, "Internal Server Error");
      }
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  return multer({ storage });
}

export async function processFile({req, res, next},allowedTypes=[]) {
  const files = req.files;
  
  try {
    if(!allowedTypes || !Array.isArray(allowedTypes) || allowedTypes.length === 0){
      console.log("ERROR: ","Required parameter allowedTypes");
      console.log("ERROR: ","Parameter allowedTypes must be an array");
      // remove invalid files
      for (const file of files) {
        await fs.unlink(file.path);
      }
      return next(new ErrorHandler(500, "Internal Server Error"));
    } 

    if(files && files.length > 0) {
      // check file type
      const invalidFiles = [];
      
      for (const file of files) {
        const buffer = await fs.readFile(file.path);
        const type = await fileTypeFromBuffer(buffer);
  
        if (!type || !allowedTypes.includes(type.mime)) {
          // file type is not allowed
          invalidFiles.push(file);
        }
      }
  
      // remove invalid files
      for (const file of invalidFiles) {
        await fs.unlink(file.path);
      }
  
      const message = invalidFiles.map(file => ({
        // name: file.originalname,
        // type: file.mimetype,
        file: `${file.originalname} ${file.mimetype}`,
        message: `only allowed types: ${allowedTypes.join(', ')}`
      }));
      if (invalidFiles.length > 0) {
        return res.status(400).json({ 
          response: false,
          statusCode: 400,
          message: "Invalid file type",
          error: message
          });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}