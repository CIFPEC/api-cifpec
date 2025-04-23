import { createProjectService, updateProjectService } from "./../services/projectServices.js";

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