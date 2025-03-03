import jwt from 'jsonwebtoken';
import { SessionModel } from './../models/index.js';
// create refresh and access token
export async function createAuthToken(res,user){
    // create refresh token
    const ResreshToken = jwt.sign({userId: user.id,userEmail: user.userEmail}, process.env.SECRET_KEY, { expiresIn:"1d" });
    // set cookies (http only)
    res.cookie("token", ResreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours or 1 day
    })
    
    // create access token
    const AccessToken = jwt.sign({userId: user.id,userEmail: user.userEmail}, process.env.ACCESS_KEY, { expiresIn:"20s" });

  try {
    // create session
    await SessionModel.create({
      userId: user.id,
      sessionToken: ResreshToken,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours or 1 day
    });

    // return access token
    return AccessToken;
  } catch (error) {
    throw error;
  }
}