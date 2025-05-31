import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { CourseModel, Database,RoleModel,SupervisorCourseModel,UserDetailModel,UserModel } from "../models/index.js";
import { createVerifyResetToken } from "./../utils/createVerifyResetToken.js";
import { checkIfExists, getProtocol, getRole, requestType } from "./../utils/helper.js";
import bcrypt from 'bcrypt';
import { withTransaction } from "./../utils/withTransaction.js";
import { createAuthToken } from "./../utils/createAuthToken.js";
import fs from 'fs/promises';
import path from "path";

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
export async function getCurrentUserService({req},{token = null, externalTransaction = null}={}) {
  const roleId = getRole();
  let user;
  return await withTransaction(async (transaction) => {
    try {
      if (req.user.roleId === roleId.ADMIN || req.user.roleId === roleId.WEB_MAINTENANCE){
        user = await UserModel.findOne({
          where: { id: req.user.userId },
          attributes: ["userName", "userEmail", "isVerify", "isLecturerActive", "isLecturerRequest", "isAdminApprove", ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
          include: [
            {
              model: RoleModel,
              as: "Role",
              attributes: [["id", "roleId"], ["name", "roleName"]],
            },
            {
              model: UserDetailModel,
              as: "Profile",
              attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"]
            }
          ],
          transaction
        });
      } else {
        // find user
        user = await UserModel.findOne({
          where: { id: req.user.userId },
          attributes: ["userName", "userEmail", "isVerify", "isLecturerActive", "isLecturerRequest", "isAdminApprove", ["created_at", "joinDate"], ["updated_at", "lastUpdate"]],
          include: [
            {
              model: RoleModel,
              as: "Role",
              attributes: [["id", "roleId"], ["name", "roleName"]],
            },
            {
              model: UserDetailModel,
              as: "Profile",
              attributes: ["userId", "userUsername", "userGender", "userPhone", "userProfileImage"],
              include: [
                {
                  model: CourseModel,
                  as: "EnrolledCourse",
                  attributes: [["id", "courseId"], ["name", "courseName"]]
                }
              ]
            }
          ],
          transaction
        });
      }
  
      const data = {
        userId: user.Profile.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        userUsername: user.Profile.userUsername,
        userGender: user.Profile.userGender,
        userPhoneNumber: user.Profile.userPhone,
        userProfileImage: user.Profile.userProfileImage,
        userRole: user.Role,
        joinDate: user.joinDate,
        lastUpdate: user.lastUpdate,
        isVerify: user.isVerify,
        isLecturerActive: user.isLecturerActive,
        isLecturerRequest: user.isLecturerRequest,
        isAdminApprove: user.isAdminApprove
      } 
  
      if (user.Profile.EnrolledCourse){
        data.userCourse = user.Profile.EnrolledCourse
      }
      if(token !== null){
        return { token,data };
      }
  
      if(data.userProfileImage){
        data.userProfileImage = getProtocol(req,"profile",data.userProfileImage);
      }

      return data;
    } catch (error) {
      console.log("GET CURRENT USER: ",error);
      throw error;
    }
  },{ERROR_MESSAGE:"GET CURRENT USER", externalTransaction});
} 

// Update Current User
export async function updateCurrentUserService({req,res},requestData){
  let currentType = null;
  const { userEmail, userName, userUsername, userGender, userPhoneNumber } = requestData;
  const updateData = { 
    newEmail: userEmail,
    userName,
    userUsername, 
    userGender, 
    userPhone: userPhoneNumber
  };
  console.log("UPDATE CURRENT USER: ",requestData);
  
  if(userEmail){
    if ((userEmail.toLowerCase()) !== (req.user.userEmail.toLowerCase())) {
      currentType = requestType("email_verification");
      updateData.isVerify = false;
    }
  }

  
  return await withTransaction(async (transaction) => {
    // find user
    const user = await UserModel.findOne({
      attributes: {
        exclude: ["userPassword", "role_id", "isLecturerRequest", "isLecturerActive", "isAdminApprove", "createdAt", "updatedAt"]
      },
      include: [
        {
          model: UserDetailModel,
          as: "Profile",
          attributes: ["userProfileImage"]
        }
      ],
      where: { id: req.user.userId },
      transaction
    });

    // update user
    await UserModel.update(updateData,{where:{id:req.user.userId},transaction});
    await UserDetailModel.update(updateData,{where:{userId:req.user.userId},transaction});

    // check if user profile image exist
    if (req.files && req.files.length > 0) {
      const userProfileImage = req.files[0].filename;
      // check if old user profile image exist
      if (user.Profile.userProfileImage) {
        // unlink old user profile image
        const oldPath = path.join(process.cwd(), "public", "uploads", "profile", user.Profile.userProfileImage);
        const exists = await checkIfExists(oldPath);
        if (exists) {
          await fs.unlink(oldPath);
        }
      }
      await UserDetailModel.update({ userProfileImage }, { where: { userId: req.user.userId }, transaction });
    }

    // check if user email changed 
    if (userEmail) {
      if (currentType !== null) {
        const findUser = await UserModel.findOne({
          attributes: {
            exclude:["userPassword","role_id"]
          },
          where: {id:req.user.userId},
          transaction
        });
        const ChangeEmail = findUser.toJSON();
        ChangeEmail.userEmail = userEmail;
        // send verify email 
        const VerifyToken = await createVerifyResetToken(ChangeEmail, currentType, transaction,{expired:4});
        return getCurrentUserService({req}, { token:VerifyToken, externalTransaction:transaction });
      }
    }
    return getCurrentUserService({req}, { externalTransaction:transaction });    
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