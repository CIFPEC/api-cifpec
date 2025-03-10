import { CourseModel, Database,RoleModel,SupervisorCourseModel,UserDetailModel,UserModel } from "../models/index.js";
import { getRole } from "./../utils/helper.js";

/**
 * ========
 * CURRENT USERS
 * --------
 * - Get Current User
 * - Update Current User
 * - Update Current User Password
 * - User Verify Email (Request Code)
 * - User Verify Email (Verify Code)
 */


// Get Current User
export async function getCurrentUserService({req}){
  const roleId = getRole();
  let user;
  try {
    if (req.user.roleId === roleId.ADMIN || req.user.roleId === roleId.WEB_MAINTENANCE){
      user = await UserModel.findOne({
        where: { id: req.user.userId },
        attributes: ["userName", "userEmail", "isVerify", ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
        include: [
          {
            model: RoleModel,
            as: "Role",
            attributes: [["id", "roleId"], ["name", "roleName"]],
          },
          {
            model: UserDetailModel,
            as: "Profile",
            attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"]
          }
        ]
      });
    } else {
      // user = await CourseModel.findOne({
      //   where: { coordinatorId: req.user.userId },
      //   attributes: [["id", "courseId"], ["name", "courseName"]],
      //   include: [
      //     {
      //       model: UserModel,
      //       as: "Coordinator",
      //       attributes: ["userName", "userEmail", "isVerify", ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
      //       include: [
      //         {
      //           model: UserDetailModel,
      //           as: "Profile",
      //           attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"]
      //         },
      //         {
      //           model: RoleModel,
      //           as: "Role",
      //           attributes: [["id", "roleId"], ["name", "roleName"]],
      //         },
      //       ]
      //     }
      //   ]
      // });
      user = await UserModel.findOne({
        where: { id: req.user.userId },
        attributes: ["userName", "userEmail", "isVerify", ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
        include: [
          {
            model: RoleModel,
            as: "Role",
            attributes: [["id", "roleId"], ["name", "roleName"]],
          },
          {
            model: UserDetailModel,
            as: "Profile",
            attributes: ["userId", "userUsername", "userGender", "userPhone", "userNickname"],
            include: [
              {
                model: CourseModel,
                as: "EnrolledCourse",
                attributes: [["id", "courseId"], ["name", "courseName"]]
              }
            ]
          }
        ]
      });
    }

    const data = {
      userId: user.Profile.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userUsername: user.Profile.userUsername,
      userGender: user.Profile.userGender,
      userPhoneNumber: user.Profile.userPhone,
      userNickname: user.Profile.userNickname,
      // userProfileImage: user.Profile.profileImage,
      userRole: user.Role,
      joinDate: user.joinDate,
      lastUpdate: user.lastUpdate,
      isVerify: user.isVerify
    } 

    if (user.Profile.EnrolledCourse){
      data.userCourse = user.Profile.EnrolledCourse
    }

    return data;
  } catch (error) {
    console.log("GET CURRENT USER: ",error);
    throw error;
  }
} 