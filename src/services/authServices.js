import { Database,UserModel,CourseModel,UserDetailModel,VerifyModel,SessionModel } from "./../models/index.js";
import { ErrorHandler } from './../exceptions/errorHandler.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SendMail from "./../utils/sendEmail.js";
import { getCodeWithToken, getRandomNumber, getRole, requestType } from "./../utils/helper.js";
import { compile } from "./../utils/compile.js";
import { createAuthToken } from "./../utils/createAuthToken.js";
import { createVerifyResetToken } from "./../utils/createVerifyResetToken.js";


/** 
 * ======
 *  AUTH 
 * ======
 * - register
 * - login
 * - logout
 * **/

// register
export async function registerService(userRequest) {
  const currentType = requestType("email_register");
  const roleId = getRole();
  const transaction = await Database.transaction();
  try {
    const user = await UserModel.findOne({where: {email: userRequest.userEmail}});
    if(user) {
      throw new ErrorHandler(409, "Validation Error",[
        {field: "email", message: "Email already exists!"},
      ]);
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    userRequest.userPassword = await bcrypt.hash(userRequest.userPassword, salt);

    if(userRequest.roleId === roleId.STUDENT){
      // check course
      const checkCourse = await CourseModel.findOne({where: {id: userRequest.courseId}});
      if(!checkCourse) {
        throw new ErrorHandler(404, "Validation Error",[
          {field: "courseId", message: "Course not found!"},
        ]);
      }
    }
  
    // create userRequest and userRequest details
    const userCreated = await UserModel.create({
      userEmail: userRequest.userEmail,
      userPassword: userRequest.userPassword,
      roleId: userRequest.roleId,
    },
    {
      transaction
    });

    if (userRequest.roleId !== roleId.ADMIN && userRequest.roleId !== roleId.WEB_MAINTENANCE) {
      await UserDetailModel.create({
        userId: userCreated.id,
        courseId: userRequest.courseId,
      },
      {
        transaction
      });
    }else{
      await UserDetailModel.create({
        userId: userCreated.id
      },
        {
          transaction
        });
    }

    const AccessToken = await createVerifyResetToken(userCreated, currentType, transaction);

    await transaction.commit();
    return AccessToken;
  } catch (error) {
    console.log("REGISTER ERROR: ",error);
    await transaction.rollback();

    // Conditional error handling
    if (error instanceof ErrorHandler) {
      throw error; // Re-throw specific error (403 in this case)
    }
    throw error;
  }
}
// login
export async function loginService(res,userRequest){
  let currentType;
  const transaction = await Database.transaction();
  try {
    // check user
    const user = await UserModel.findOne({where: {userEmail: userRequest.userEmail}});
    if(!user) {
      throw new ErrorHandler(401, "Unauthorized",[
        {field: "email", message: "Invalid email or password"},
        {field: "password", message: "Invalid email or password"},
      ]);
    }
    
    // compare password
    const isMatch = await bcrypt.compare(userRequest.userPassword, user.userPassword);
    if(!isMatch) {
      throw new ErrorHandler(401, "Unauthorized",[
        {field: "email", message: "Invalid email or password"},
        {field: "password", message: "Invalid email or password"},
      ]);
    }

    if (!user.isVerify) {
      currentType = requestType('email_verification');
      const token = await createVerifyResetToken(user,currentType,transaction);
      throw new ErrorHandler(403, "Forbidden",[
        {field: "email", message: "Email not verify!"},
        {field: "verifyType", message: "email_verification"},
        {field: "verifyToken", token},
      ]);
    } else if (user.isTwoStep) {
      currentType = requestType('email_login');
      const token = await createVerifyResetToken(user,currentType,transaction);
      throw new ErrorHandler(401, "Unauthorized",[
        {field: "email", message: "Email not verify!"},
        {field: "verifyType", message: "email_login"},
        {field: "verifyToken", token},
      ]);
    }

    // create access token
    const AccessToken = await createAuthToken(res,user);
    
    // return access token
    await transaction.commit();
    return AccessToken;
  } catch (error) {
    console.log("LOGIN ERROR: ",error);
    await transaction.rollback();
    throw error;
  }
}
// logout
export async function logoutService(req,res){
  // check cookies
  const refreshToken = req.cookies.token;
  if(!refreshToken) {
    throw new ErrorHandler(401, "Unauthorized",[
      {header: "Token", message: "Required token"},
    ]);
  }
  
  const transaction = await Database.transaction(); 
  try {
    // compare refresh token from client and database
    const checkRefreshToken = await SessionModel.findOne({where:{sessionToken:refreshToken,userId:req.user.userId}});
    if(!checkRefreshToken) {
      throw new ErrorHandler(403, "Forbidden",[
        {header: "Token", message: "Invalid token"},
      ]);
    }

    // delete session
    await SessionModel.destroy({where:{sessionToken:refreshToken}}, {transaction});
    // clear cookie
    res.clearCookie("token");
    // commit transaction
    await transaction.commit();
    return true;
  } catch (error) {
    console.log("LOGOUT ERROR: ",error);
    await transaction.rollback();
    throw error;
  }
}

/** 
 * =======
 *  RESET 
 * =======
 * - reset
 * **/

// reset
export async function resetService(token,user) {
  // get bearer token from header
  if(!token) {
    throw new ErrorHandler(401, "Unauthorized",[
      {header: "Reset-Token", message: "Required token"},
    ]);
  }

  const transaction = await Database.transaction();
  try {
    // verify JWT token
    jwt.verify(token, process.env.VERIFY_KEY, function(err, decoded) {
      if(err) {
        throw new ErrorHandler(403, "Forbidden",[
          {header: "Reset-Token", message: "Invalid or expired token"},
        ]);
      }
      // compare email
      if(decoded.userEmail !== user.userEmail) {
        throw new ErrorHandler(403, "Forbidden",[
          {header: "Reset-Token", message: "Invalid or expired token"},
        ]);
      }
      user.userId = decoded.userId;
    })

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.newPassword = await bcrypt.hash(user.newPassword, salt);
    
    // update password
    await UserModel.update({userPassword: user.newPassword}, {where: {id: user.userId}}, {transaction});
    
    await transaction.commit();
    return true;
  } catch (error) {
    console.log("RESET ERROR: ",error);
    await transaction.rollback();
    throw error;
  }
}

/** 
 * ===============
 *   VERIFY EMAIL 
 * ===============
 * - verify email & code 
 * - requestCode
 * **/

// verify code email & code reset password
export async function verifyService(token,user,type,res) {
  let currentType = requestType(type);

  // get bearer token from header
  if(currentType.value === "verify") {
    if(!token) {
      throw new ErrorHandler(401, "Unauthorized",[
        {header: "Verify-Token", message: "Required token"},
      ]);
    }
  }

  const transaction = await Database.transaction();
  try {
    // compare code and email from request
    const verify = await VerifyModel.findOne({where: {
      verifyCode: user.verifyCode, 
      verifyEmail: user.userEmail, 
      verifyType: currentType.value
    }});
    if(!verify) {
      throw new ErrorHandler(404, "Validation Error",[
        {field: "verifyCode", message: "Invalid verification code"},
        {field: "verifyEmail", message: "Invalid verification email"},
      ]);
    }

    // check verify userid is ecpired or not
    if (verify.expiredAt < new Date()) {
      throw new ErrorHandler(404, "Validation Error",[
        {field: "verifyCode", message: "Verification code is expired!"},
      ]);
    }

    // check verify token
    if (currentType.value === "verify") {
      if (token !== verify.verifyToken) {
        throw new ErrorHandler(401, "Unauthorized",[
          {header: "Verify-Token", message: "Invalid or expired token"},
        ]);
      }
      // verify JWT token
      jwt.verify(token, process.env.VERIFY_KEY, function(err, decoded) {
        if(err) {
          throw new ErrorHandler(403, "Forbidden",[
            {header: "Verify-Token", message: "Invalid or expired token"},
          ]);
        }
      })
    }
    
    // update user
    await UserModel.update({isVerify: 1}, {where: {id: verify.userId}}, {transaction});
    const userData = await UserModel.findOne({where: {id: verify.userId}});
    
    // delete verify
    await VerifyModel.destroy({where: {userId: verify.userId}}, {transaction});
    
    await transaction.commit();
    // check verify type
    if (currentType.value === "reset") {
      // create jwt token
      const result = getCodeWithToken({userId: verify.userId,userEmail: verify.verifyEmail}, currentType, {expired: 10});
      return result.token;
    }
    return createAuthToken(res,userData);
  } catch (error) {
    console.log("VERIFY ERROR: ",error);
    await transaction.rollback();

    // Conditional error handling
    if (error instanceof ErrorHandler) {
      throw error; // Re-throw specific error (403 in this case)
    }
    throw error;
  }
}

// request code email verification & code reset password
export async function requestCodeService(email,type) {
  const currentType = requestType(type);

  const transaction = await Database.transaction();
  try {
    // check user
    const user = await UserModel.findOne({ where: { userEmail: email } });
    if (!user) {
      throw new ErrorHandler(403, "Forbidden",[
        { field: "email", message: "If your email is correct, verification code will be sent to your email"},
      ]);
    }

    // check if email is verify
    if (currentType.value === "verify") {
      if (user.isVerify) {
        throw new ErrorHandler(403, "Forbidden",[
          { field: "userEmail", message: "Email already verify!"},
        ]);
      }
    }

    // check verify userid is ecpired or not
    const verify = await VerifyModel.findOne({ where: { userId: user.id } });
    if (verify) {
      // delete verify
      await VerifyModel.destroy({ where: { userId: user.id }, transaction });
    }

    // create verifyToken and random number
    const result = getCodeWithToken({
      userId: user.id,
      userEmail: user.userEmail,
      roleId: user.roleId
    }, currentType);

    const data = {
      userId: result.userId,
      verifyCode: result.code,
      verifyEmail: result.userEmail,
      verifyType: result.currentType.value === "resetCode" ? "reset" : "verify",
      expiredAt: result.expiredTime
    }
    // set verify token if current type is verify
    if(result.currentType.value === "verify"){
      data.verifyToken = result.token[`${result.currentType.value}Token`]
    }
    // create verify
    await VerifyModel.create(data, { transaction });

    // get template
    const htmlOutput = await compile({
      email: result.userEmail,
      code: result.code,
      minutes: result.minutes
    }, result.currentType.emailCode);

    // send email
    await SendMail(
      {senderName: process.env.SENDER_NAME, senderEmail: process.env.SENDER_EMAIL},
      {to: result.userEmail, subject: result.currentType.subject, body: htmlOutput});

    await transaction.commit();
    if(result.currentType.value === "resetCode"){
      return {userEmail:result.userEmail}
    }
    return result.token;
  } catch (error) {
    console.log("REQUEST CODE ERROR: ",error);
    await transaction.rollback();

    // Conditional error handling
    if (error instanceof ErrorHandler) {
      throw error; // Re-throw specific error (403 in this case)
    }
    throw error;
  }
}
