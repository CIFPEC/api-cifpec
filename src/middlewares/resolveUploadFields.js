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
  next();
}

export default resolveUploadFields;