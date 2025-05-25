import { withTransaction } from "./../utils/withTransaction.js";
import { getRole } from './../utils/helper.js';
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
      exclude: ["id", "userPassword", "role_id", "roleId", "isLecturerRequest", "createdAt", "updatedAt"],
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
    Options.transaction = transaction;
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
      exclude: ["id", "userPassword", "role_id", "roleId", "isLecturerRequest", "createdAt", "updatedAt"],
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
  const { isApproved, isActive } = req.body;
  const ROLE = getRole();

  
  // exclude Student in ROLE
  delete ROLE.STUDENT;
  
  // check role user request
  if (req.user.roleId === ROLE.ADMIN) {
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
                required: true,
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
            { isAdminApprove: isApproved, isLecturerActive: false },
            { where: { id: userId }, transaction }
          );
        }else{
          await UserModel.update(
            { isAdminApprove: isApproved, isLecturerActive: true },
            { where: { id: userId }, transaction }
          );
  
          await CourseModel.update(
            { coordinatorId: userId },
            { where: { id: user.Profile.EnrolledCourse.dataValues.courseId }, transaction }
          )
      
          await SupervisorCourseModel.create({
            courseId:user.Profile.EnrolledCourse.dataValues.courseId,
            supervisorId:userId
          },{transaction});
        }
      }else if(req.body.hasOwnProperty("isActive")){
        await UserModel.update(
          { isLecturerActive: isActive },
          { where: { id: userId }, transaction }
        );
      }
     
      user = await UserModel.findOne({
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
                required: true,
                attributes: [["id", "courseId"], ["name", "courseName"]],
              }
            ]
          }
        ],
        where: {
          id: userId,
          isVerify: true
        },
        transaction
      });
      
      const { Role, Profile, ...rest } = user.toJSON(); // convert instance to plain object
      const { EnrolledCourse, ...restProfile } = Profile || {};
  
      return {
        ...rest,
        ...restProfile,
        userRole: Role,
        userCourse: EnrolledCourse
      };
    }, { ERROR_MESSAGE: "UPDATE LECTURER" });
  }else if(Object.values(ROLE).includes(req.user.roleId)){
    // if not admin required request query 'request=true'
    if(!req.query.request || req.query.request !== "true" ){
      throw new ErrorHandler(403, "Forbidden", [
        { header: "Authorization", message: "You are not authorized" }
      ])
    }
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
                required: true,
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
      const UserRequest = user.toJSON();
      if (!UserRequest.userName || !UserRequest.Profile.userUsername || !UserRequest.Profile.userGender || !UserRequest.Profile.userPhone) {
        throw new ErrorHandler(400, "Bad Request", [
          { parameter: "userId", message: "User profile is incomplete. Please update it to continue." },
        ]);
      }      

      if (!Object.values(ROLE).includes(req.user.roleId)) {
        throw new ErrorHandler(400, "Bad Request", [
          { parameter: "userId", message: "User cannot be updated" },
        ]);
      }

      await UserModel.update(
        { isLecturerRequest: true },
        { where: { id: req.user.userId }, transaction }
      );

      user = await UserModel.findOne({
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
                required: true,
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
      const { EnrolledCourse, ...restProfile } = Profile || {};

      return {
        ...rest,
        ...restProfile,
        userRole: Role,
        userCourse: EnrolledCourse
      };
    }, { ERROR_MESSAGE: "UPDATE LECTURER" });
  }
}

