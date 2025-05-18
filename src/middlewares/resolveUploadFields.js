import { BatchFieldModel } from "./../models/index.js";

async function resolveUploadFields(req, res, next) {
  const batchId = req.user.batchId;
  const fileFields = await BatchFieldModel.findAll({
    where: {
      batchId,
      fieldType: 'file'
    }
  });

  req.uploadFields = fileFields.map(f => f.fieldTag);
  req.uploadFields = [...req.uploadFields, "projectThumbnail"];
  next();
}

export default resolveUploadFields;