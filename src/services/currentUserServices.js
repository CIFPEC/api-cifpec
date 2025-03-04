import { CourseModel, Database,RoleModel,UserDetailModel,UserModel } from "../models/index.js";

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
  try {
    const user = await UserModel.findOne({
      where: { 
        id: req.user.userId, 
        userEmail: req.user.userEmail 
      },
      include: [
        {
          model: RoleModel,
          as: "Role",
          attributes: ["id", "name"],
        },
        {
          model: UserDetailModel,
          as: "Profile",
        },
        {
          model:CourseModel,
          as:"courses",
          attributes: ["id","name"]
        }
      ],
    });
    console.log(user);
    // console.log(UserModel.associations);
    // const data = {
    //   userId: user.id,
    //   course: user.Course.name,
    //   email: user.userEmail,
    //   username: user.userDetails.username,
    //   gender: user.userDetails.gender,
    //   phoneNumber: user.userDetails.phoneNumber,
    //   nickname: user.userDetails.nickname,
    //   profileImage: user.userDetails.profileImage,
    //   role: user.role.name,
    //   // accountStatus: "active",
    //   joinDate: user.createdAt,
    //   lastUpdate: user.updatedAt,
    //   isVerify: user.isVerify
    // } 

    // return data;
    return;
  } catch (error) {
    console.log("GET CURRENT USER: ",error);
    throw error;
  }
} 