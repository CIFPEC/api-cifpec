import { ProjectFieldValueModel } from "./../models/index.js";
import fs from "fs/promises";
import path from "path";
import { checkIfExists } from "./helper.js";

export async function deleteReplacedProjectFiles({
  projectId,
  batchFields, // Batch Fields From Database
  newValues, // New Fields Values From Request
  transaction
}) {
  // find all existing Fields Value
  const existing = await ProjectFieldValueModel.findAll({ where: { projectId }, transaction });

  for (const newField of newValues) {
    // get new value from validated fields
    const meta = batchFields.find(f => f.id === newField.fieldId);
    // check if field type is file
    if (meta?.fieldType === "file") {
      // find old field
      const oldField = existing.find(v => v.fieldId === newField.fieldId);
      // check if field value is changed
      if (oldField && oldField.fieldValue !== newField.fieldValue) {
        const pathToFile = path.join(process.cwd(), "public","uploads", "project-files", oldField.fieldValue);
        if (await checkIfExists(pathToFile)) {
          await fs.unlink(pathToFile);
        }
      }
    }
  }
}
