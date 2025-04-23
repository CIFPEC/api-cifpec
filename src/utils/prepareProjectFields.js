import { ErrorHandler } from "./../exceptions/errorHandler.js";

export default function prepareProjectFields({ batchFields, requirements, projectId }) {
  const errors = [];
  const valuesToInsert = [];

  for (const field of batchFields) {
    const tag = field.fieldTag;
    const value = requirements[tag];

    // Required check
    if (field.isRequired && (!value || value === "")) {
      errors.push({
        field: tag,
        message: `${tag} is required`
      });
      continue;
    }

    // Type check
    if (value !== undefined && value !== "") {
      switch (field.fieldType) {
        case "email":
          if (!/^\S+@\S+\.\S+$/.test(value)) {
            errors.push({
              field: tag,
              message: `${tag} must be a valid email`
            });
          }
          break;
        case "number":
          if (isNaN(value)) {
            errors.push({
              field: tag,
              message: `${tag} must be a number`
            });
          }
          break;
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

  if (errors.length > 0) {
    const errorField = errors.map(item => item.field).join(", ");
    throw new ErrorHandler(400, "Bad Request", [
      { field: errorField, message: "Validation Failed" },
      ...errors
    ]);
  }

  return valuesToInsert;
}