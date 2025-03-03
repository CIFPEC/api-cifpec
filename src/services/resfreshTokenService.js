import { ErrorHandler } from "./../exceptions/errorHandler.js";
import jwt from 'jsonwebtoken';
import {Database, SessionModel} from "./../models/index.js";

// renew access token
export async function renewAccessTokenService(req,res) {
  const refreshToken = req.cookies.token;
  if(!refreshToken) {
    throw new ErrorHandler(401, "Unauthorized",[
      {header: "Authorization", message: "Required token"},
    ]);
  }

  const transaction = await Database.transaction();
  try {
    // compare refresh token from client and database
    const checkRefreshToken = await SessionModel.findOne({where:{sessionToken:refreshToken}});
    if(!checkRefreshToken) {
      throw new ErrorHandler(403, "Unauthorized",[
        {header: "Authorization", message: "Invalid token"},
      ]);
    }

    /**
     * check refresh token is expired or not
     * if expired, delete refresh token
     *  */ 
    if(checkRefreshToken.expiryTime < new Date()) {
      await SessionModel.destroy({where:{sessionToken:refreshToken}}, {transaction});
      res.clearCookie("token");
      throw new ErrorHandler(403, "Forbidden",[
        {header: "Authorization", message: "Token is expired"},
      ]);
    }

    // verify refresh token
    let token;
    jwt.verify(refreshToken, process.env.SECRET_KEY, function(err, decoded) {
      if(err) {
        throw new ErrorHandler(403, "Forbidden",[
          {header: "Authorization", message: "Invalid token"},
        ]);
      }
      // create access token
      const AccessToken = jwt.sign({userId: checkRefreshToken.userId,userEmail: checkRefreshToken.userEmail}, process.env.ACCESS_KEY, { expiresIn:"20s" });
      token = AccessToken;
    })
    return token;
  } catch (error) {
    console.log("RENEW ACCESS TOKEN ERROR: ",error);
    throw error;
  }
}
