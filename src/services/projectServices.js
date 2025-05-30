import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { checkIfExists, getProtocol, getRole } from "./../utils/helper.js";
import prepareProjectFields from "./../utils/prepareProjectFields.js";
import { withTransaction } from "./../utils/withTransaction.js";
import { ProjectModel, ProjectMemberModel, UserDetailModel, UserModel, BatchModel, CourseModel, SupervisorCourseModel, BatchFieldModel, ProjectFieldValueModel, ProjectArchiveModel, ProjectMemberArchiveModel } from "./../models/index.js";
import { Op } from "sequelize";
import fs from 'fs/promises';
import path from "path";
import { deleteReplacedProjectFiles } from "./../utils/deleteReplacedProjectFiles.js";
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
      console.log("ERROR: ","Course ID not found in session");
      throw new ErrorHandler(500, "Internal Server Error");
    }

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

    // find all user in course
    const users = await UserModel.findAll({
      attributes:[["id","userId"],"userName"],
      include:[
        {
          model:UserDetailModel,
          as: "Profile",
          where:{
            is_final:false,
            course_id: courseId,
            batch_id: batchId
          }
        }
      ],
      where:{
        role_id: ROLE.STUDENT
      },
      transaction,
      raw:false
    });

    const validUserIds = users.map(user => Number(user.dataValues.userId));
    const allValid = teams.every(id => validUserIds.includes(Number(id)));
    if (!allValid) {
      throw new ErrorHandler(400, "Bad Request", [
        { field: "teams", message: "Please select students only from your course" }
      ]);
    }

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
          where: { isArchived: false },
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
    const data = await getProjectByIdService(req,newProject.id, transaction);
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
        projectId: project.Project.projectId,
        projectName: project.Project.projectName,
        projectThumbnail: project.Project?.projectThumbnail ? getProtocol(req,"projects",project.Project.projectThumbnail) : null,
        batchId: project.Project.Batch.batchId,
        batchName: project.Project.Batch.batchName,
        courseId: project.Project.ProjectCourse.courseId,
        courseName: project.Project.ProjectCourse.courseName,
        courseCoordinatorName: project.Project.ProjectCourse?.Coordinator?.coordinatorName || null,
        courseSupervisorId: project.Project.Supervisor?.supervisorId || null,
        courseSupervisorName: project.Project.Supervisor?.supervisorName || null,
        projectCreatedAt: project.Project.createdAt,
        isFinal: project.Project.Batch.isFinal,
        projectRequirements: project.Project.ProjectFieldValues.map((field) => {
          return {
            fieldName: field.BatchField.fieldName,
            fieldValue: field.fieldValue,
          };
        }),
        projectTeamMembers: project.Project.ProjectMembers.map((member) => {
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
    try {
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
        requirements: req.body.requirements || {},
        projectId,
        files: req.files || []
      });

      // check if data is valid
      await deleteReplacedProjectFiles({
        projectId,
        batchFields,
        newValues: validateData,
        transaction
      });
            
      // get projectThumbnail
      const thumbnailFile = req.files.find(f => f.fieldname === "projectThumbnail");
      // check existing thumbnail
      if (thumbnailFile) {
        let projectThumbnail = thumbnailFile.filename;
        if(project.projectThumbnail){
          const oldThumbnail = path.join(process.cwd(), "public", "uploads", "project-files", project.projectThumbnail);
          const exists = await checkIfExists(oldThumbnail);
          if (exists) {
            await fs.unlink(oldThumbnail);
          }
        }
        // update project thumbnail
        await ProjectModel.update(
          { projectThumbnail },
          { where: { id: projectId }, transaction }
        );
      }
      
      // create/update project field value with updateOnDuplicate
      await ProjectFieldValueModel.bulkCreate(validateData, {
        updateOnDuplicate: ['fieldValue'],
        transaction,
      });

      const data = await getProjectByIdService(req,projectId);
      // return data;
      return data;
    } catch (error) {
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await fs.unlink(file.path);
        }
      }
      throw error;
    }
  }, { ERROR_MESSAGE:"UPDATE PROJECT SERVICE" });
}

// Move project to archive (NEW)
export async function archiveProjectService({req,res}){
  const projectId = req.params.projectId; // ambil dari route / request

  return await withTransaction(async (transaction) => {
    const project = await getProjectByIdService(req,projectId);
    let memberToInsert = project.projectTeamMembers;
    const [updatedCount] = await ProjectModel.update(
    {
      isArchived: true,
    }, 
    {
      where: { id: projectId },
      transaction
    });
    
    // if update project failed
    if (updatedCount < 1){
      console.log("ERROR: ","Failed to update project");
      throw new ErrorHandler(500, "Internal Server Error");
    }

    // check project archive if project ID is exist
    const projectArchive = await ProjectArchiveModel.findOne({
      where: { project_id: projectId },
    });
    if(projectArchive){
      console.log("ERROR: ","Project ID already exist");
      throw new ErrorHandler(400, "Bad Request",[
        { field:"projectId", message:"Project ID already exist" }
      ])
    }

    // update project member
    memberToInsert = memberToInsert.map(member => ({
      projectId: projectId,
      userId: member.userId
    }));

    // check project member archive if project ID and user ID is exist
    const projectMemberArchive = await ProjectMemberArchiveModel.findOne({
      where: { project_id: projectId },
    });
    if(projectMemberArchive){
      console.log("ERROR: ","Project ID already exist");
      throw new ErrorHandler(400, "Bad Request",[
        { field:"projectId", message:"Project ID already exist" }
      ])
    }
    
    // update projectTeamMembers
    project.projectTeamMembers = project.projectTeamMembers.map(member => member.userId);
    await ProjectArchiveModel.create(project, {transaction});

    // insert project member
    await ProjectMemberArchiveModel.bulkCreate(memberToInsert, {transaction});

    return await getProjectArchiveByIdService({req,res},transaction);
  }, { ERROR_MESSAGE:"ARCHIVE PROJECT SERVICE" });
}

// Get project by id (NEW)
export async function getProjectByIdService(req,projectId,externalTransaction=false) {
  const secondParameter = {
    ERROR_MESSAGE:"GET PROJECT BY ID",
  }
  // check external transaction
  if(externalTransaction){
    secondParameter.externalTransaction = externalTransaction;
  }
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
  
    const { Supervisor, ProjectCourse, Batch, ProjectMembers, ProjectFieldValues, id, projectThumbnail, ...detailProject } = project.toJSON();
    const data = {
      projectId: id,
      ...detailProject,
      projectThumbnail: projectThumbnail ? getProtocol(req,"projects",projectThumbnail) : null,
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
  },secondParameter)
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

    const data = projects.docs.map((project) => ({
      projectId: project.projectId,
      projectName: project.projectName,
      projectThumbnail: project.projectThumbnail ? getProtocol(req,"projects",project.projectThumbnail) : null,
      batchId: project.batchId,
      batchName: project.batchName,
      courseId: project.courseId,
      courseName: project.courseName,
      courseCoordinatorName: project.courseCoordinatorName,
      courseSupervisorId: project.courseSupervisorId,
      courseSupervisorName: project.courseCoordinatorName,
      projectCreatedAt: project.projectCreatedAt,
      isFinal: project.isFinal
    }));

    const result = {
      paginate: {
        currentPage: page,
        totalPages: projects.pages,
        totalItems: projects.total,
      },
      data
    }
    return result;
  }, { ERROR_MESSAGE:"GET ALL PROJECTS SERVICE" });
}

// Get project by ID (Archived)
export async function getProjectArchiveByIdService({req,res},externalTransaction=null){
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

  const secondparams = { ERROR_MESSAGE: "GET PROJECT ARCHIVE BY ID" };
  if(externalTransaction) {
    secondparams.externalTransaction = externalTransaction;
  }
  return await withTransaction(async (transaction) => {
    // const projects = await ProjectArchiveModel.findAll({transaction});
    const findProject = await ProjectArchiveModel.findOne({
      where: { project_id: projectId },
      include: [
        {
          model: ProjectMemberArchiveModel,
          as: "ArchivedMembers",
          attributes: ["userId"],
          include: [
            {
              model: UserDetailModel,
              as: "ArchivedUser",
              attributes: [["id", "userId"]],
              include: [
                {
                  model: UserModel,
                  as: "User",
                  attributes: [["id", "userId"], "userName"]
                }
              ],
            },
          ],
        }
      ],
      transaction
    });
    const project = findProject.toJSON();
    project.projectTeamMembers = project.ArchivedMembers.map((member) => ({
      userId: member.ArchivedUser.userId,
      userName: member.ArchivedUser.User.userName,
    }));
    delete project.ArchivedMembers;
    project.projectThumbnail = getProtocol(req,"projects",project.projectThumbnail);
    return project;
  },secondparams);
}