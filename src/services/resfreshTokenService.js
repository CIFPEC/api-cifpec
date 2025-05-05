import { ErrorHandler } from "./../exceptions/errorHandler.js";
import jwt from 'jsonwebtoken';
import {Database, SessionModel} from "./../models/index.js";
import { CreateAccessToken } from "./../utils/helper.js";
import { withTransaction } from "./../utils/withTransaction.js";

// renew access token
export async function renewAccessTokenService(req,res) {
  const refreshToken = req.cookies.token;
  if(!refreshToken) {
    throw new ErrorHandler(401, "Unauthorized",[
      {header: "Authorization", message: "Required token"},
    ]);
  }
  return await withTransaction(async (transaction) => {
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
        {header: "Authorization", message: "Connection Timeout"},
        {header: "Authorization", message: "Token is expired"},
      ]);
    }
  
    // verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
      delete decoded.iat;
      delete decoded.exp;

      // create access token
      return CreateAccessToken(decoded);
    } catch (error) {
      throw new ErrorHandler(403, "Forbidden", [
        { header: "Authorization", message: "Invalid token" },
      ]);
    }
  }, { ERROR_MESSAGE: "RENEW ACCESS TOKEN ERROR" } );
}
