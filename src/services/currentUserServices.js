import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { CourseModel, Database,RoleModel,SupervisorCourseModel,UserDetailModel,UserModel } from "../models/index.js";
import { createVerifyResetToken } from "./../utils/createVerifyResetToken.js";
import { getRole, requestType } from "./../utils/helper.js";
import bcrypt from 'bcrypt';
import { withTransaction } from "./../utils/withTransaction.js";
import { createAuthToken } from "./../utils/createAuthToken.js";

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
export async function getCurrentUserService({req},token = null){
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
    if(token !== null){
      return { token,data };
    }

    return data;
  } catch (error) {
    console.log("GET CURRENT USER: ",error);
    throw error;
  }
} 

// Update Current User
export async function updateCurrentUserService({req,res},requestData){
  let currentType = null;
  const { userEmail, userName, userUsername, userGender, userPhone, userProfileImage } = requestData;
  const updateData = { 
    userEmail,
    userName,
    userUsername, 
    userGender, 
    userPhone, 
    userProfileImage
  };
  if(userEmail){
    if ((userEmail.toLowerCase()) !== (req.user.userEmail.toLowerCase())) {
      currentType = requestType("email_verification");
      updateData.isVerify = false;
    }
  }

  return await withTransaction(async (transaction) => {
    await UserModel.update(updateData,{where:{id:req.user.userId},transaction});
    await UserDetailModel.update(updateData,{where:{userId:req.user.userId},transaction});
    
    // check if user email changed 
    if (userEmail) {
      if (currentType !== null) {
        const user = await UserModel.findOne({
          attributes: {
            exclude:["userPassword","role_id"]
          },
          where: {id:req.user.userId},
          transaction
        });
        // send verify email 
        await createAuthToken({req,res},user);
        const VerifyToken = await createVerifyResetToken(user, currentType, transaction);
        return getCurrentUserService({req}, VerifyToken);
      }
    }
    return getCurrentUserService({req});    
  }, { ERROR_MESSAGE:"UPDATE CURRENT USER"})
}

// Update Current User Password
export async function updateCurrentUserPasswordService({ req }, requestData) {
  const transaction = await Database.transaction();
  try {
    // compare password 
    const user = await UserModel.findOne({where:{id:req.user.userId}});
    const isMatch = await bcrypt.compare(requestData.oldPassword, user.userPassword);
    if(!isMatch){
      throw new ErrorHandler(403,"Forbidden",[
        { field: "oldPassword", message: "Incorrect old password. Please check and try again." },
      ]);
    }

    // hash password before changed
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(requestData.newPassword, salt);
    await UserModel.update({userPassword:newPassword}, { where: { id: req.user.userId } }, { transaction });
    
    await transaction.commit();
    return true;
  } catch (error) {
    console.log("UPDATE CURRENT USER PASSWORD: ", error);
    await transaction.rollback();
    throw error;
  }
}