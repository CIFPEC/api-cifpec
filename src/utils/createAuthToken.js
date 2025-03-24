import jwt from 'jsonwebtoken';
import { RoleModel, SessionModel, UserModel } from './../models/index.js';
import { CreateAccessToken } from './helper.js';
import { renewAccessTokenService } from '../services/resfreshTokenService.js';
// create refresh and access token
export async function createAuthToken({req,res},user){
  try {
    const Role = await RoleModel.findOne({where: {id: user.roleId},attributes: [["id","roleId"],["name","roleName"]]});
    let AccessToken;
    // create refresh token
    const ResreshToken = jwt.sign({userId: user.id, userEmail: user.userEmail, roleId: Role.dataValues.roleId, roleName: Role.roleName}, process.env.SECRET_KEY, { expiresIn:"1d" });
    // check existing cookie token
    if (!req.cookies.token){
      // set cookies (http only)
      res.cookie("token", ResreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
      })

      // create access token
      AccessToken = CreateAccessToken({ userId: user.id, userEmail: user.userEmail, roleId: Role.dataValues.roleId, roleName: Role.roleName });

      // create session
      await SessionModel.create({
        userId: user.id,
        sessionToken: ResreshToken,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours or 1 day
      });
    }else{
      // set cookies (http only)
      res.cookie("token", ResreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
      })

      // update session
      return await SessionModel.update({
        sessionToken: ResreshToken,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours or 1 day
      },{where:{userId:user.id}});

      // renew access token
      // AccessToken = await renewAccessTokenService(req,res);
    }
  

    // return access token
    return AccessToken;
  } catch (error) {
    throw error;
  }
}