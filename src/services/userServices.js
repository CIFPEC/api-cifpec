import { withTransaction } from "./../utils/withTransaction.js";
import { getProtocol, getRole } from './../utils/helper.js';
import { Op } from "sequelize";
import { BatchModel, CourseModel, ProjectModel, RoleModel, SupervisorCourseModel, UserDetailModel, UserModel } from "./../models/index.js";
import { ErrorHandler } from "./../exceptions/errorHandler.js";

/**
 * ========
 * USERS
 * --------
 * - Get all users (current batch)
 * - Get all lecturer (current batch)
 * - Update Lecturer by ID (Admin Only)
 * - Get all students (All Courses)
 * - Get all students (in batch and course)
 */

// Get all lecturer(current batch)
export async function getAllLecturerService({req,res}) {
  const ROLE = getRole();

  // check if request query
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  // set maximum limit is 20 
  (limit > 20) ? limit = 20 : limit;
  const offset = (page - 1) * limit;
  
  const whereCondition = {
    roleId: {
      [Op.notIn]: [ROLE.STUDENT],
    },
    isVerify: true,
    isAdminApprove: true,
  };
  // if request query isApproved
  if (req.query.isApproved) {
    // check value isApproved
    if (req.query.isApproved === "true") {
      whereCondition.isAdminApprove = true;
    }else if (req.query.isApproved === "false") {
      whereCondition.isAdminApprove = false;
      whereCondition.isLecturerRequest = true;
    }
  }

  // If course filter exists
  const courseFilter = req.query.course
    ? { id: parseInt(req.query.course) }
    : undefined;

  // If role filter exists
  const roleFilter = req.query.roles
    ? { id: parseInt(req.query.roles) }
    : undefined;

  const Options = {
    attributes: {
      exclude: ["id", "userPassword", "role_id", "roleId", "isLecturerRequest", "newEmail", "createdAt", "updatedAt"],
      include: [["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
    },
    where: whereCondition,
    include: [
      {
        model: RoleModel,
        as: "Role",
        required: true,
        attributes: [["id", "roleId"], ["name", "roleName"]],
        where: roleFilter
      },
      {
        model: UserDetailModel,
        as: "Profile",
        required: true,
        attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"],
        include: [
          {
            model: CourseModel,
            as: "EnrolledCourse",
            attributes: [["id", "courseId"], ["name", "courseName"]],
            where: courseFilter,
          }
        ]
      }
    ],
    offset,
    limit,
    order: [["created_at", "DESC"]]
  }

  return await withTransaction(async (transaction) => {
    Options.transaction = transaction;
    let result = await UserModel.findAndCountAll(Options);

    // Reshape data
    const reshapedData = result.rows.map(user => {
      const { Role, Profile, ...rest } = user.toJSON(); // convert instance to plain object

      // Extract EnrolledCourse if exists
      const EnrolledCourse = Profile?.EnrolledCourse || {};
      return {
        ...rest,
        userId: Profile?.userId,        
        userUsername: Profile?.userUsername,
        userGender: Profile?.userGender,
        userPhone: Profile?.userPhone,
        userProfileImage: Profile?.userProfileImage ? getProtocol(req,"profile",Profile?.userProfileImage) : null,
        userRole: Role,              // rename Role to userRole
        userCourse: EnrolledCourse
      };
    });

    return {
      paginate: {
        currentPage: page,
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
      },
      data: reshapedData
    }
  },{ ERROR_MESSAGE:"GET ALL LECTURER" });
}

// Get all students(All Courses)
export async function getAllStudentService({req,res}) {
  const ROLE = getRole();

  // check if request query
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  // set maximum limit is 20 
  (limit > 20) ? limit = 20 : limit;
  const offset = (page - 1) * limit;

  const whereCondition = {
    roleId: {
      [Op.eq]: [ROLE.STUDENT],
    },
    isVerify: true,
  };

  const whereUserDetail = {
    isFinal: false,
  };

  // If course filter exists
  const courseFilter = req.query.course
    ? { id: parseInt(req.query.course) }
    : undefined;

  const Options = {
    attributes: {
      exclude: ["id", "userPassword", "role_id", "roleId", "isLecturerRequest", "newEmail", "createdAt", "updatedAt"],
      include: [["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
    },
    where: whereCondition,
    include: [
      {
        model: RoleModel,
        as: "Role",
        required: true,
        attributes: [["id", "roleId"], ["name", "roleName"]],
      },
      {
        model: UserDetailModel,
        as: "Profile",
        required: true,
        attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"],
        where: whereUserDetail,
        include: [
          {
            model: CourseModel,
            as: "EnrolledCourse",
            required: true,
            attributes: [["id", "courseId"], ["name", "courseName"]],
            where: courseFilter,
          }
        ]
      }
    ],
    offset,
    limit,
    order: [["created_at", "DESC"]]
  }

  return await withTransaction(async (transaction) => {
    // get latest batch
    let latestBatch = await BatchModel.findOne({
      attributes: [["id", "batchId"], ["name", "batchName"]],
      order: [["created_at", "DESC"]],
      transaction
    });
    latestBatch = latestBatch.toJSON();
    
    // check lastest batch
    if(!latestBatch) {
      console.log("ERROR: ","Batch not found.");
      throw new ErrorHandler(500, "Internal Server Error");
    }

    Options.transaction = transaction;
    if(req.user.roleName === "admin"){
      whereUserDetail.batchId = latestBatch.batchId;
    }else{
      whereUserDetail.batchId = req.user.batchId;
    }

    let result = await UserModel.findAndCountAll(Options);

    // Reshape data
    const reshapedData = result.rows.map(user => {
      const { Role, Profile, ...rest } = user.toJSON(); // convert instance to plain object

      // Extract EnrolledCourse if exists
      const { EnrolledCourse, ...profileRest } = Profile || {};
      return {
        ...rest,
        ...profileRest,                 // flatten Profile
        userRole: Role,              // rename Role to userRole
        userProfileImage : Profile?.userProfileImage ? getProtocol(req,"profile",Profile?.userProfileImage) : null,
        userCourse: EnrolledCourse
      };
    });

    return {
      paginate: {
        currentPage: page,
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
      },
      data: reshapedData
    }
  }, { ERROR_MESSAGE: "GET ALL STUDENTS" });
}

// Update Lecturer by ID (Admin Only)
export async function updateLecturerService({ req, res }) {
  const { userId } = req.params;
  const { isApproved } = req.body;
  const ROLE = getRole();

  
  // exclude Student in ROLE
  delete ROLE.STUDENT;
  
  // check if req.params request
  if (req.query.request && req.query.request === "true") {
    // check role
    if (Object.values(ROLE).includes(req.user.roleId)) {
      return await withTransaction(async (transaction) => {
        let user = await UserModel.findOne({
          attributes: {
            include: [["id", "userId"], ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
            exclude: ["id", "userPassword", "role_id", "roleId", , "createdAt", "updatedAt"],
          },
          include: [
            {
              model: RoleModel,
              as: "Role",
              required: true,
              attributes: [["id", "roleId"], ["name", "roleName"]],
            },
            {
              model: UserDetailModel,
              as: "Profile",
              required: true,
              attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"],
              include: [
                {
                  model: CourseModel,
                  as: "EnrolledCourse",
                  attributes: [["id", "courseId"], ["name", "courseName"]],
                }
              ]
            }
          ],
          where: {
            id: req.user.userId,
            isVerify: true
          },
        });

        if (!user) {
          throw new ErrorHandler(404, "Not Found", [
            { parameter: "userId", message: "you are not authorized" },
          ]);
        }

        // check if profile is incomplete
        const UserRequest = user?.toJSON();
        if (!UserRequest.userName || !UserRequest.Profile.userUsername || !UserRequest.Profile.userGender || !UserRequest.Profile.userPhone) {
          throw new ErrorHandler(400, "Bad Request", [
            { parameter: "userId", message: "User profile is incomplete. Please update it to continue." },
          ]);
        }

        await UserModel.update(
          { isLecturerRequest: true },
          { where: { id: req.user.userId }, transaction }
        );

        return await getUserByIdService({ req, res }, transaction);
      }, { ERROR_MESSAGE: "UPDATE LECTURER" });
    }
    throw new ErrorHandler(403, "Forbidden", [
      { token: "role", message:"You don't have permission to access this resource." }
    ])
  }

  // check if user is admin
  if(req.user.roleName !== "admin"){
    throw new ErrorHandler(403, "Forbidden",[
      { token: "role", message:"You are not authorized to perform this action" }
    ])
  }
  return await withTransaction(async (transaction) => {
    let user = await UserModel.findOne({
      attributes: {
        include: [["id", "userId"], ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
        exclude: ["id", "userPassword", "role_id", "roleId",, "createdAt", "updatedAt"],
      },
      include: [
        {
          model: RoleModel,
          as: "Role",
          required: true,
          attributes: [["id", "roleId"], ["name", "roleName"]],
        },
        {
          model: UserDetailModel,
          as: "Profile",
          required: true,
          attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"],
          include: [
            {
              model: CourseModel,
              as: "EnrolledCourse",
              attributes: [["id", "courseId"], ["name", "courseName"]],
            }
          ]
        }
      ],
      where: { 
        id: userId, 
        isVerify: true,
        isLecturerRequest: true
      },
    });

    if (!user) {
      throw new ErrorHandler(404, "Not Found", [
        { parameter: "userId", message: "User not found or profile is incomplete" },
      ]);
    }

    const roleId = user.Role.dataValues.roleId;
    if (!Object.values(ROLE).includes(roleId)) {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "userId", message: "User cannot be updated" },
      ]);
    }
    if(req.body.hasOwnProperty("isApproved")){
      if(!isApproved){
        await UserModel.update(
          { isLecturerRequest: isApproved, isAdminApprove: isApproved, isLecturerActive: isApproved },
          { where: { id: userId }, transaction }
        );

        // check if user role == 'coordinator' or 'supervisor'
        if (user.Role.dataValues.roleName === "coordinator" || user.Role.dataValues.roleName === "supervisor") {
          const courseId = user.toJSON()?.Profile?.EnrolledCourse?.courseId;

          if (!courseId) {
            throw new ErrorHandler(400, "Bad Request", [
              { field: "userId", message: "User is not linked to any course as a supervisor or coordinator." }
            ]);
          }

          // check if user is exist in SupervisorCourse
          const supervisorExists = await SupervisorCourseModel.findOne({
            where: {
              courseId,
              supervisorId: userId
            },
            transaction
          })

          if (supervisorExists) {
            await SupervisorCourseModel.destroy({
              where: {
                courseId,
                supervisorId: userId
              }, transaction
            });
          }
        }
      }else{
        // check if user already approved
        if(user.isAdminApprove){
          throw new ErrorHandler(400, "Bad Request", [
            { field: "userId", message: "User already approved" }
          ]);
        }

        await UserModel.update(
          { isAdminApprove: isApproved, isLecturerActive: isApproved },
          { where: { id: userId }, transaction }
        );

        // check if user role == 'coordinator'
        if (user.Role.dataValues.roleName === "coordinator" || user.Role.dataValues.roleName === "supervisor") {
          const courseId = user.toJSON()?.Profile?.EnrolledCourse?.courseId;
          if (!courseId) {
            console.log("User does not have a course ID");
            throw new ErrorHandler(500,"Internal Server Error");
          }
          // check if user role == 'coordinator'
          if (user.Role.dataValues.roleName === "coordinator") {
            await CourseModel.update(
              { coordinatorId: userId },
              { where: { id: courseId }, transaction }
            )
          }

          await SupervisorCourseModel.create({
            courseId:user.Profile.EnrolledCourse.dataValues.courseId,
            supervisorId:userId
          },{transaction});
        }
    
      }
    }
    
    return await getUserByIdService({req,res}, transaction)
  }, { ERROR_MESSAGE: "UPDATE LECTURER" });
}

// Get user by ID (NEW)
export async function getUserByIdService({req,res}, externalTransaction = null) {
  const secondParams = { ERROR_MESSAGE: "GET USER BY ID" };
  if(externalTransaction) {
    secondParams.externalTransaction = externalTransaction;
  }

  return await withTransaction(async (transaction) => {
    const user = await UserModel.findOne({
      attributes: {
        include: [["id", "userId"], ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
        exclude: ["id", "userPassword", "role_id", "roleId", "newEmail" , "createdAt", "updatedAt"],
      },
      include: [
        {
          model: RoleModel,
          as: "Role",
          required: true,
          attributes: [["id", "roleId"], ["name", "roleName"]],
        },
        {
          model: UserDetailModel,
          as: "Profile",
          required: true,
          attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"],
          include: [
            {
              model: CourseModel,
              as: "EnrolledCourse",
              attributes: [["id", "courseId"], ["name", "courseName"]],
            }
          ]
        }
      ],
      where: {
        id: req.user.userId,
        isVerify: true
      },
      transaction
    });
    const { Role, Profile, ...rest } = user.toJSON(); // convert instance to plain object
    // Extract EnrolledCourse if exists
    const EnrolledCourse = Profile?.EnrolledCourse || {};
    return {
      ...rest,
      userId: Profile?.userId,
      userUsername: Profile?.userUsername,
      userGender: Profile?.userGender,
      userPhone: Profile?.userPhone,
      userProfileImage: Profile?.userProfileImage ? getProtocol(req, "profile", Profile?.userProfileImage) : null,
      userRole: Role,              // rename Role to userRole
      userCourse: EnrolledCourse
    };
  }, secondParams);
}

