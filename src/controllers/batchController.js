import { createBatchService, getAllProjectByBatchService, getBatchService, getProjectInBatchByIdService, updateBatchService } from "./../services/batchServices.js";

/**
 * ========
 * BATCHES
 * --------
 * - Get all batches
 * - get batch by id
 * - Create batch
 * - Update batch
 * 
 * - get all project by batch id
 * - get project in batch by id
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

// PUBLIC ROUTE
// Get all project by batch id
export async function getAllProjectByBatch(req, res, next){
  try {
    const projects = await getAllProjectByBatchService({req, res});
    res.status(200).json({
      statusCode:200,
      message:"Get all project by batch successfuly!",
      paginate: projects.paginate,
      data: projects.data,
    })
  } catch (error) {
    next(error);
  }
}

// Get project in batch by ID
export async function getProjectInBatchById(req, res, next){
  try {
    const project = await getProjectInBatchByIdService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Get project in batch successfuly!",
      data: project
    })
  } catch (error) {
    next(error);
  }
}