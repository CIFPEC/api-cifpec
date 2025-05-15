import { archiveProjectService, createProjectService, getAllProjectService, getAllUserProjectService, getProjectArchiveByIdService, updateProjectService } from "./../services/projectServices.js";

/**
 * ========
 * PROJECTS
 * --------
 * - Create Project
 * - Get all students in project (not final)
 * - Update Project
 * - Get all projects in batch
 * - Get project in batch by ID
 * - Get all projects (Archived)
 * - Get project by ID (Archived)
 */


// Create Project
export async function createProject(req, res, next) {
  try {
    const project = await createProjectService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Create Project Successfuly",
      data: project,
    })
  } catch (error) {
    next(error);
  }
}

// Get all students in project (not final)
export async function getAllProject(req, res, next){
  try {
    const projects = await getAllUserProjectService({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get all projects successfuly!",
      // data: projects.data || [],
      // paginate: projects.paginate || {}
      data: projects
    })
  } catch (error) {
    next(error);
  }
}

// Update Project
export async function updateProject(req, res, next){
  try {
    const project = await updateProjectService({req,res});
    res.status(200).json({
      statusCode: 200,
      message: "Project has been updated!",
      data: project
    });
  } catch (error) {
    next(error);
  }
}

// Get all projects (Archived)
export async function getAllProjectArchive(req, res, next){
  try {
    const projects = await getAllProjectService({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get all projects successfuly!",
      paginate: projects.paginate,
      data: projects.data
    })
  } catch (error) {
    next(error);
  }
}

// Get project by ID (Archived)
export async function getProjectArchiveById(req, res, next){
  try {
    const projects = await getProjectArchiveByIdService({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get all projects successfuly!",
      data: projects
    })
  } catch (error) {
    next(error);
  }
}

// move project to archive (NEW)
export async function archiveProject(req, res, next){
  try {
    const project = await archiveProjectService({req,res});
    res.status(200).json({
      statusCode: 200,
      message: "Project has been archived!",
      data: project
    })
  } catch (error) {
    next(error);
  }
}