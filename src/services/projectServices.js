import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { getRole } from "./../utils/helper.js";
import prepareProjectFields from "./../utils/prepareProjectFields.js";
import { withTransaction } from "./../utils/withTransaction.js";
import { ProjectModel, ProjectMemberModel, UserDetailModel, UserModel, BatchModel, CourseModel, SupervisorCourseModel, BatchFieldModel, ProjectFieldValueModel } from "./../models/index.js";
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
export async function createProjectService({req,res}){
  const { projectName, teams } = req.body;
  const ROLE = getRole();

  return await withTransaction(async (transaction) => {
    // find user
    const user = await UserDetailModel.findOne({
      attributes:["courseId"],
      where:{ user_id:req.user.userId },
      transaction
    });

    const courseId = user.courseId;
  
    // find all user in course
    const users = await UserModel.findAll({
      attributes:[["id","userId"],"userName"],
      include:[
        {
          model:UserDetailModel,
          as: "Profile",
          where:{
            is_final:false,
            course_id: courseId
          }
        }
      ],
      where:{
        role_id: ROLE.STUDENT
      },
      transaction,
      raw:false
    });

    // 1. find active batch
    const latestBatch = await BatchModel.findOne({
      include: {
        model: CourseModel,
        as:"batchCourses",
        where: { id: courseId },
        through: { attributes: [] }, // from batch_courses
      },
      where: { is_final: false },
      order: [["created_at", "DESC"]],
    });

    if (!latestBatch) {
      throw new ErrorHandler(400, "Bad Request",[
        { field:"teams", message:"Batch active is not exist in this course" }
      ])
    }
  
    const batchId = latestBatch.id;

    // find supervisor in course
    const supervisorCourse =  await SupervisorCourseModel.findOne({
      where:{ courseId },
      transaction
    });

    if(!supervisorCourse){
      throw new ErrorHandler(400, "Bad Request",[
        { field:"teams", message:"Supervisor is not set in thie course" }
      ])
    }

    const supervisorId = supervisorCourse.supervisorId;
  
    // Create project
    const newProject = await ProjectModel.create({
      projectName,
      courseId,
      batchId,
      supervisorId,
    },{transaction});

    // filter user in teams
    let final = users.map((user) => ({
      userId: user.dataValues.userId,
      projectId: newProject.id
      // userName: user.dataValues.userName
    }));

    final = final.filter((user) => teams.includes(user.userId));

    await ProjectMemberModel.bulkCreate(final,{transaction});

    // Fetch related data
    const [batch, course, supervisor] = await Promise.all([
      BatchModel.findByPk(latestBatch.id,{transaction}),
      CourseModel.findByPk(user.courseId, {
        include: [{ model: UserModel, as: "Coordinator" }],
        transaction
      }),
      newProject.supervisorId
        ? UserModel.findByPk(newProject.supervisorId,{transaction})
        : null,
    ]);

    const data = {
      projectId: newProject.id,
      projectName: newProject.projectName,
      supervisorId: newProject.supervisorId,
      supervisorName: supervisor?.userName || null,
      thumbnail: newProject.projectThumbnail,
      coordinatorName: course?.coordinator?.userName || null,
      createdAt: newProject.created_at,
      batchName: latestBatch.batchName,
      isFinal: batch?.isFinal,
      isComplate: newProject.isComplete,
    }
    return data;
  }, { ERROR_MESSAGE:"CREATE PROJECT SERVICE" });
}

// Get all students in project(not final)
export async function getAllUserProjectService({req,res}){
  return await withTransaction(async (transaction) => {
    // check session batchId
    if (!req.user.batchId && req.user.batchId === null) {
      throw new ErrorHandler(403, "Forbidden", [
        { token: "batchId", message: "Complete profile before accessing this resource." }
      ])
    }

    // check session courseId
    if (!req.user.courseId && req.user.courseId === null) {
      throw new ErrorHandler(403, "Forbidden", [
        { token: "courseId", message: "Complete profile before accessing this resource." }
      ])
    }
    
    // check session userId
    if (!req.user.userId && req.user.userId === null) {
      throw new ErrorHandler(403, "Forbidden", [
        { token: "userId", message: "Complete profile before accessing this resource." }
      ])
    }
    const userId = req.user.userId;

    const userProjects = await UserModel.findOne({
      where: { id: userId },
      attributes:[],
      include: [
        {
          model: ProjectMemberModel,
          as: "ProjectMembers",
          attributes: ["projectId", "userId"],
          include: [
            {
              model: ProjectModel,
              as: "Project",
              attributes: [["id", "projectId"], "projectName", "projectThumbnail", "supervisorId", "isComplete", "createdAt"],
              include: [
                {
                  model: UserModel,
                  as: "Supervisor",
                  attributes: [["id", "supervisorId"], ["name", "supervisorName"]] // get supervisor
                },
                {
                  model: CourseModel,
                  as: "ProjectCourse",
                  attributes: [["id", "courseId"], ["name", "courseName"]], // get course
                  include: [
                    {
                      model: UserModel,
                      as: "Coordinator",
                      attributes: [["id", "coordinatorId"], ["name", "coordinatorName"]] // get coordinator
                    }
                  ]
                },
                {
                  model: BatchModel,
                  as: "Batch",
                  attributes: [["id", "batchId"], "batchName", "isFinal"] // get batch
                },
                {
                  model: ProjectFieldValueModel,
                  as: "ProjectFieldValues",
                  attributes: ["fieldValue"],
                  include: [
                    {
                      model: BatchFieldModel,
                      as: "BatchField",
                      attributes: ["fieldName"],
                    }
                  ],
                },
                {
                  model: ProjectMemberModel,
                  as: "ProjectMembers",
                  attributes: ["projectId"],
                  include: [
                    {
                      model: UserModel,
                      as: "User",
                      attributes: [["id", "userId"], "userName"]
                    },
                  ],
                }
              ],
              order: [['created_at', 'DESC']],
            }
          ],
        }
      ],
      transaction
    });

    const { ProjectMembers } = userProjects.toJSON();
    const projects = ProjectMembers.map((project) => {
      return {
        projectId: project.Project.id,
        projectName: project.Project.projectName,
        supervisorId: project.Project.supervisorId,
        supervisorName: project.Project.Supervisor?.supervisorName || null,
        thumbnail: project.Project?.projectThumbnail || null,
        coordinatorName: project.Project.ProjectCourse?.Coordinator?.coordinatorName || null,
        batchName: project.Project.Batch.batchName,
        isFinal: project.Project.Batch.isFinal,
        isComplete: project.Project.isComplete,
        createdAt: project.Project.createdAt,
        requirements: project.Project.ProjectFieldValues.map((field) => {
          return {
            fieldName: field.BatchField.fieldName,
            fieldValue: field.fieldValue,
          };
        }),
        teams: project.Project.ProjectMembers.map((member) => {
          return {
            userId: member.User.userId,
            userName: member.User?.userName || null,
          };
        }),
      };
    });
    
    return projects;
  },{ERROR_MESSAGE:"GET ALL USER PROJECT"});
}

// Update Project
export async function updateProjectService({req,res}){
  return await withTransaction(async (transaction) => {
    // get project ID from params
    const { projectId } = req.params;
    // find project
    const project = await ProjectModel.findByPk(projectId,{transaction});
    
    // check if project exist
    if(!project){
      throw new ErrorHandler(400, "Bad Request",[
        { field:"teams", message:"Project not found" }
      ])
    }
    
    // check session batchId
    if(!req.user.batchId && req.user.batchId === null){
      throw new ErrorHandler(403, "Forbidden",[
        { token: "batchId", message:"Complete profile before accessing this resource." }
      ])
    }
    const batchId = req.user.batchId;

    // check session courseId
    if(!req.user.courseId && req.user.courseId === null){
      throw new ErrorHandler(403, "Forbidden",[
        { token: "courseId", message:"Complete profile before accessing this resource." }
      ])
    }
    const courseId = req.user.courseId;

    // get all batchField in batch
    const batchFields = await BatchFieldModel.findAll({
      where:{ batchId }
    })
    
    // prepare data and check dataType,isRequired
    const validateData = prepareProjectFields({
      batchFields,
      requirements: req.body.requirements,
      projectId
    });
    
    // create/update project field value with updateOnDuplicate
    await ProjectFieldValueModel.bulkCreate(validateData, {
      updateOnDuplicate: ['fieldValue'],
      transaction,
    });
    
    // Fetch related data
    const [batch, course, supervisor, newProject] = await Promise.all([
      BatchModel.findByPk(batchId, { transaction }),
      CourseModel.findByPk(courseId, {
        include: [{ model: UserModel, as: "Coordinator" }],
        transaction
      }),
      project.supervisorId
        ? UserModel.findByPk(project.supervisorId, { transaction })
        : null,
      ProjectModel.findByPk(projectId,{transaction})
    ]);

    const data = {
      projectId: newProject.id,
      projectName: newProject.projectName,
      supervisorId: newProject.supervisorId,
      supervisorName: supervisor?.userName || null,
      thumbnail: newProject.projectThumbnail,
      coordinatorName: course?.coordinator?.userName || null,
      createdAt: newProject.created_at,
      batchName: batch.batchName,
      isFinal: batch?.isFinal,
      isComplate: newProject.isComplete,
    }
    // return data;
    return data;
  }, { ERROR_MESSAGE:"UPDATE PROJECT SERVICE" });
}


