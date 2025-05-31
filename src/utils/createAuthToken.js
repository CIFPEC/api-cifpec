import jwt from 'jsonwebtoken';
import { BatchModel, CourseModel, RoleModel, SessionModel, UserDetailModel, UserModel } from './../models/index.js';
import { CreateAccessToken } from './helper.js';

// create refresh and access token
export async function createAuthToken({req,res},user){
  try {
    // const Role = await RoleModel.findOne({where: {id: user.roleId},attributes: [["id","roleId"],["name","roleName"]]});
    const User = await UserModel.findOne({
      attributes:[["id","userId"],"userEmail",],
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
          attributes: ["userId","courseId","batchId"],
          include: [
            {
              model: CourseModel,
              as: "EnrolledCourse",
              attributes: [["id", "courseId"], ["name", "courseName"]],
              include:[
                {
                  model:BatchModel,
                  as:"coursesInBatch",
                  attributes:[["id","batchId"],["name","batchName"]],
                  through:{attributes:[]}
                }
              ]
            }
          ]
        }
      ],
      where:{id:user.id}
    });

    const { Profile, Role, ...userDetail } = User.toJSON();
    const { EnrolledCourse } = Profile || {};
    const { coursesInBatch } = EnrolledCourse || {};
    const [ course ] = coursesInBatch || [];

    let AccessToken;
    const prepareData = { 
      ...userDetail,
      roleId: Role.roleId, 
      roleName: Role.roleName,
      courseId: Profile?.courseId || null,
      batchId: Profile?.batchId || null 
    }

    // create refresh token
    const ResreshToken = jwt.sign(prepareData, process.env.SECRET_KEY, { expiresIn:"1d" });
    // check existing cookie token
    if (!req.cookies.token){
      // set cookies (http only)
      // check ENVIRONMENT_MODE
      if (process.env.ENVIRONMENT_MODE !== "Production") {
        res.cookie("token", ResreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
        })
      } else {
        res.cookie("token", ResreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
        })
      }

      // create access token
      AccessToken = CreateAccessToken(prepareData);

      // create session
      await SessionModel.create({
        userId: user.id,
        sessionToken: ResreshToken,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours or 1 day
      });
    }else{
      // set cookies (http only)
      // check ENVIRONMENT_MODE
      if(process.env.ENVIRONMENT_MODE !== "Production") {
        res.cookie("token", ResreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
        })
      }else{
        res.cookie("token", ResreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
        })
      }

      // update session
      await SessionModel.update({
        sessionToken: ResreshToken,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours or 1 day
      },{where:{userId:user.id}});
      return; 

      // renew access token
      // AccessToken = await renewAccessTokenService(req,res);
    }
  

    // return access token
    return AccessToken;
  } catch (error) {
    throw error;
  }
}