import { withTransaction } from "./../utils/withTransaction.js";
import { getRole } from './../utils/helper.js';
import { Op } from "sequelize";
import { CourseModel, ProjectModel, RoleModel, UserDetailModel, UserModel } from "./../models/index.js";
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
        attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"],
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
        attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"],
        where:{
          "is_fInal":false
        },
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
  }, { ERROR_MESSAGE: "GET ALL STUDENTS" });
}

// Update Lecturer by ID (Admin Only)
export async function updateLecturerService({ req, res }) {
  const { userId } = req.params;
  const { isApproved, isActive } = req.body;

  const ROLE = getRole();
  // exclude Student in ROLE
  delete ROLE.STUDENT;

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
          attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"],
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
    });

    if (!user) {
      throw new ErrorHandler(404, "Not Found", [
        { parameter: "userId", message: "User not found" },
      ]);
    }

    if (Object.values(ROLE).includes(user.roleId)) {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "userId", message: "User cannot be updated" },
      ]);
    }
    
    await UserModel.update(
      { isApprove: isApproved, isLecturerActive: isActive },
      { where: { id: userId }, transaction }
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
          attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"],
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
}

// Get all students (in batch and course)
export async function getStudentByBatchAndCourseService({ req, res }) {
  // const { batch_id, course_id } = req.params;

  // const page = parseInt(req.query.page) || 1;
  // let limit = parseInt(req.query.limit) || 5;
  // limit = limit > 20 ? 20 : limit;
  // const offset = (page - 1) * limit;

  // return await withTransaction(async (transaction) => {
  //   const result = await UserModel.findAndCountAll({
  //     where: {
  //       roleId: getRole().STUDENT,
  //       isVerify: true,
  //     },
  //     attributes: {
  //       exclude: ["userPassword", "createdAt", "updatedAt"],
  //       include: [["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
  //     },
  //     include: [
  //       {
  //         model: UserDetailModel,
  //         as: "Profile",
  //         required: true,
  //         where: {
  //           is_final: false,
  //           courseId: course_id,
  //         },
  //         include: [
  //           {
  //             model: CourseModel,
  //             as: "EnrolledCourse",
  //             required: true,
  //             attributes: [["id", "courseId"], ["name", "courseName"]],
  //           }
  //         ]
  //       },
  //       {
  //         model: RoleModel,
  //         as: "Role",
  //         required: true,
  //         attributes: [["id", "roleId"], ["name", "roleName"]],
  //       },
  //       {
  //         model: ProjectModel,
  //         as: "StudentProject", // make sure ada alias ni
  //         required: true,
  //         where: {
  //           batchId: batch_id,
  //           courseId: course_id,
  //         },
  //       }
  //     ],
  //     offset,
  //     limit,
  //     order: [["created_at", "DESC"]],
  //     transaction
  //   });

  //   const reshapedData = result.rows.map(user => {
  //     const { Role, Profile, ...rest } = user.toJSON();
  //     const { EnrolledCourse, ...profileRest } = Profile || {};
  //     return {
  //       ...rest,
  //       ...profileRest,
  //       userRole: Role,
  //       userCourse: EnrolledCourse
  //     };
  //   });

  //   return {
  //     paginate: {
  //       currentPage: page,
  //       totalPages: Math.ceil(result.count / limit),
  //       totalItems: result.count,
  //     },
  //     data: reshapedData
  //   };
  // }, { ERROR_MESSAGE: "GET STUDENT BY BATCH & COURSE" });

  try {
    const user = await UserModel.associations;
    console.log(user);
    return;
  } catch (error) {
    throw error;
  }
}
