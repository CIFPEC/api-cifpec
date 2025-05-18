import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { getRole } from "./../utils/helper.js";
import prepareProjectFields from "./../utils/prepareProjectFields.js";
import { withTransaction } from "./../utils/withTransaction.js";
import { ProjectModel, ProjectMemberModel, UserDetailModel, UserModel, BatchModel, CourseModel, SupervisorCourseModel, BatchFieldModel, ProjectFieldValueModel, ProjectArchiveModel } from "./../models/index.js";
import { Op } from "sequelize";
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
  const { projectName, teams, supervisorId } = req.body;
  const ROLE = getRole();

  return await withTransaction(async (transaction) => {
    const courseId = req.user.courseId || null;

    // check session courseId
    if(!req.user.courseId && courseId === null){
      console.log("ERROR: ","Complete profile before accessing this resource.");
      throw new ErrorHandler(500, "Internal Server Error");
    }

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
      where:{ courseId, supervisorId },
      transaction
    });

    if(!supervisorCourse){
      throw new ErrorHandler(400, "Bad Request",[
        { field:"supervisorId", message:"Supervisor is not set in this course" }
      ])
    }

    // check if user have already project
    const existingProject = await ProjectMemberModel.findOne({
      where: {
        userId: req.user.userId
      },
      include: [
        {
          model: ProjectModel,
          as: "Project",
          include: [
            {
              model: BatchModel,
              as: "Batch",
              where: { isFinal: false } // batch sekarang
            }
          ]
        }
      ],
      transaction
    });

    if (existingProject) {
      throw new ErrorHandler(400, "Bad Request",[
        { field:"userId", message:"You already have a project in this batch" }
      ])
    }
  
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
    }));

    // filter user in teams
    final = final.filter((user) => teams.includes(user.userId));

    // add user in project
    final.push({
      userId: req.user.userId,
      projectId: newProject.id
    })

    // add user in project
    await ProjectMemberModel.bulkCreate(final,{transaction});

    // Fetch related data
    const [batch, course, supervisor] = await Promise.all([
      BatchModel.findByPk(latestBatch.id,{transaction}),
      CourseModel.findByPk(courseId, {
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

// move project to archive (NEW)
export async function archiveProjectService({req,res}){
  const projectId = req.params.projectId; // ambil dari route / request

  return await withTransaction(async (transaction) => {
    const project = await getProjectByIdService(projectId);
    // const updatedProject = await ProjectModel.update(
    // {
    //   // isArchive: true,
    //   isFinal: true
    // }, 
    // {
    //   where: { id: projectId },
    //   transaction
    // });
  
    const createArchive = await ProjectArchiveModel.create(project, {transaction});
    console.log("PROJECT: ", createArchive);
    return;
  }, { ERROR_MESSAGE:"ARCHIVE PROJECT SERVICE" });
}

// get project by id (NEW)
export async function getProjectByIdService(projectId) {
  if(!projectId){
    console.log("ERROR: project id is required");
    throw new ErrorHandler(500, "Internal Server Error");
  }
  return await withTransaction(async (transaction) => { 
    const project = await ProjectModel.findOne({
      where: { id: projectId },
      attributes: ["id", "projectName", "projectThumbnail"],
      include: [
        {
          model: UserModel,
          as: "Supervisor",
          attributes: ["id", "name"],
        },
        {
          model: CourseModel,
          as: "ProjectCourse",
          attributes: {
            include: [["created_at", "createdAt"]],
            exclude: ["created_at", "updated_at", "coordinator_id"]
          },
          include: [
            {
              model: UserModel,
              as: "Coordinator",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: BatchModel,
          as: "Batch",
          attributes: ["id", "batchName", "isFinal"],
        },
        {
          model: ProjectMemberModel,
          as: "ProjectMembers",
          include: [
            {
              model: UserModel,
              as: "User",
              attributes: ["id", "name"]
            },
          ],
        },
        {
          model: ProjectFieldValueModel,
          as: "ProjectFieldValues",
          include: [
            {
              model: BatchFieldModel,
              as: "BatchField"
            }
          ]
        }
      ],
      transaction
    });
  
    // check if project exist
    if (!project) {
      throw new ErrorHandler(400, "Bad Request", [
        { field: "projectId", message: "Project not found" }
      ])
    }
  
    const { Supervisor, ProjectCourse, Batch, ProjectMembers, ProjectFieldValues, id, ...detailProject } = project.toJSON();
    console.log("SUPERVISOR: ", Supervisor);
    const data = {
      projectId: id,
      ...detailProject,
      batchId: Batch.id,
      batchName: Batch.batchName,
      courseId: ProjectCourse?.id,
      courseName: ProjectCourse?.courseName,
      courseCoordinatorName: ProjectCourse?.Coordinator?.name,
      courseSupervisorId: Supervisor.id,
      courseSupervisorName: Supervisor.name,
      projectCreatedAt: ProjectCourse?.createdAt,
      projectRequirements: ProjectFieldValues.map((fieldValue) => ({
        fieldName: fieldValue?.BatchField?.fieldName,
        fieldValue: fieldValue?.fieldValue
      })),
      projectTeamMembers: ProjectMembers.map((member) => ({
        userId: member.User.id,
        userName: member.User.name
      })),
      isFinal: Batch.isFinal,
    };
    return data;
  },{ERROR_MESSAGE:"GET PROJECT BY ID"})
}


// Get all projects (Archived)
export async function getAllProjectService({req,res}){
  const {name, batch, field, course} = req.query;

  // check if request query
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  // set maximum limit is 20 
  (limit > 20) ? limit = 20 : limit;

  // Dynamic filters
  const filters = {};

  if (name) {
    filters.projectName = {
      [Op.like]: `%${name}%`
    };
  }

  if (course) {
    filters.courseId = course; // Assuming exact match
  }

  if (batch) {
    filters.batchId = batch;
   }

  return await withTransaction(async (transaction) => {
    // const projects = await ProjectArchiveModel.findAll({transaction});
    const projects = await ProjectArchiveModel.paginate({
      page, 
      paginate: limit, 
      where: filters, 
      transaction
    });
    const result = {
      paginate: {
        currentPage: page,
        totalPages: projects.pages,
        totalItems: projects.total,
      },
      data: projects.docs
    }
    return result;
  }, { ERROR_MESSAGE:"GET ALL PROJECTS SERVICE" });
}

// Get project by ID (Archived)
export async function getProjectArchiveByIdService({req,res}){
  const projectId = parseInt(req.params.projectId);
  
  if(!req.params.projectId){
    throw new ErrorHandler(400, "Bad Request",[
      { field:"projectId", message:"Project ID is required" }
    ])
  }

  if (isNaN(projectId)){
    throw new ErrorHandler(400, "Bad Request",[
      { field:"projectId", message:"Project ID must be a number" }
    ])
  }

  return await withTransaction(async (transaction) => {
    // const projects = await ProjectArchiveModel.findAll({transaction});
    const projects = await ProjectArchiveModel.findByPk(req.params.projectId,{transaction});
    return projects;
  }, { ERROR_MESSAGE:"GET PROJECT BY ID" });
}