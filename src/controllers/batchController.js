import { createBatchService, getBatchService, updateBatchService } from "./../services/batchServices.js";

/**
 * ========
 * BATCHES
 * --------
 * - Get all batches
 * - get batch by id
 * - Create batch
 * - Update batch
 */


// Get all batches
export async function getAllBatches(req,res,next){
  try {
    const batches = await getBatchService({req});
    res.status(200).json({
      statusCode:200,
      message:"Get batches successfuly!",
      data:batches.data,
      paginate:batches.paginate
    })
  } catch (error) {
    next(error);
  }
}
// get batch by id
export async function getBatchById(req,res,next){
  try {
    const batch = await getBatchService({ req });
    res.status(200).json({
      statusCode: 200,
      message: "Get batch successfuly!",
      data: batch
    })
  } catch (error) {
    next(error);
  }
}
// Create batch
export async function createBatch(req,res,next){
  try {
    const batch = await createBatchService(req.body);
    res.status(200).json({
      statusCode: 200,
      message: "Create batch successfuly!",
      data: batch
    })
  } catch (error) {
    next(error);
  }
}
// Update batch
export async function updateBatchById(req,res,next){
  try {
    const batch = await updateBatchService({req,res},req.body);
    res.status(200).json({
      statusCode: 200,
      message: "Update batch successfuly!",
      data: batch
    })
  } catch (error) {
    next(error);
  }
}