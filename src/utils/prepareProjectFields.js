import { ErrorHandler } from "./../exceptions/errorHandler.js";
import path from 'path';

export default function prepareProjectFields({ batchFields, requirements, projectId, files = [] }) {
  const errors = [];
  const valuesToInsert = [];

  const validators = {
    email: (val) => /^\S+@\S+\.\S+$/.test(val),
    number: (val) => !isNaN(val),
    url: (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    phone: (val) => /^[0-9+\-\s]{7,15}$/.test(val),
    date: (val) => !isNaN(Date.parse(val)),
    text: (val) => typeof val === 'string' && val.trim() !== '',
  };
  
  for (const field of batchFields) {
    const tag = field.fieldTag;
    let value = requirements[tag];

    // File support
    if (field.fieldType === "file") {
      const uploadedFile = files.find(f => f.fieldname === `requirements[${tag}]`);
      if (field.isRequired && !uploadedFile) {
        errors.push({ field: tag, message: `${tag} file is required` });
        continue;
      }
      if (uploadedFile && uploadedFile.path) {
        // const relativePath = uploadedFile.path.split("public")[1];
        // value = relativePath ? relativePath.replace(/\\/g, "/") : null;
        value = uploadedFile.filename;
      }
    }

    // Auto trim string (if string type)
    if (typeof value === 'string') {
      value = value.trim(); 
    }

    // Required check
    if (field.isRequired && (value === undefined || value === null || value === "")) {
      errors.push({
        field: tag,
        message: `${tag} is required`
      });
      continue;
    }

    // Skip type check for file
    if (field.fieldType !== "file") {
      // Type check
      if (value !== undefined && value !== "" && validators[field.fieldType]) {
        const isValid = validators[field.fieldType](value);
        if (!isValid) {
          errors.push({
            field: tag,
            message: `${tag} must be a valid ${field.fieldType}`,
          });
          continue;
        }
      }
    }

    // Push valid data
    if (!errors.find(e => e.field === tag) && value !== undefined) {
      valuesToInsert.push({
        projectId: parseInt(projectId),
        fieldId: field.id,
        fieldValue: value
      });
    }
  }

  // Final error check
  if (errors.length > 0) {
    const errorField = errors.map(item => item.field).join(", ");
    throw new ErrorHandler(400, "Bad Request", [
      { field: errorField, message: "Validation Failed" },
      ...errors
    ]);
  }

  return valuesToInsert;
}