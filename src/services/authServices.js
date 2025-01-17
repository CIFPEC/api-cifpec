import { Database,Users,Courses,UserDetails,Verifies } from "./../models/index.js";
import { ErrorHandler } from './../exceptions/errorHandler.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SendMail from "./../utils/sendEmail.js";
import { getCodeWithToken, getRandomNumber, getRole, requestType } from "./../utils/helper.js";
import { compile } from "./../utils/compile.js";


/** 
 * ======
 *  AUTH 
 * ======
 * **/
// register
export async function registerService(user) {
  const currentType = requestType("email_register");
  const roleId = getRole();
  const transaction = await Database.transaction();
  try {
    const checkUser = await Users.findOne({where: {email: user.userEmail}});
    if(checkUser) {
      throw new ErrorHandler(409, "Email already exists!");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.userPassword = await bcrypt.hash(user.userPassword, salt);

    if(user.roleId === roleId.STUDENT){
      // check course
      const checkCourse = await Courses.findOne({where: {id: user.courseId}});
      if(!checkCourse) {
        throw new ErrorHandler(404, "Course not found!");
      }
    }
  
    // create user and user details
    const userCreated = await Users.create({
      userEmail: user.userEmail,
      userPassword: user.userPassword,
      roleId: user.roleId,
    },
    {
      transaction
    });

    if (user.roleId === roleId.STUDENT) {
      await UserDetails.create({
        userId: userCreated.id,
        courseId: user.courseId,
      },
      {
        transaction
      });
    }

    // create verifyToken and random number
    const result = getCodeWithToken({userId: userCreated.id,userEmail: userCreated.userEmail}, currentType);
    
    // create verify
    await Verifies.create({
      userId: result.userId,
      verifyCode: result.code,
      verifyToken: result.token[`${result.currentType.value}Token`],
      verifyEmail: result.userEmail,
      verifyType: result.currentType.value,
      expiredAt: result.expiredTime
    }, {
      transaction
    });

    // get template
    const htmlOutput = await compile({
      email: result.userEmail,
      code: result.code,
      minutes: result.minutes
    },result.currentType.emailCode);

    // send email
    await SendMail(
      {senderName: process.env.SENDER_NAME, senderEmail: process.env.SENDER_EMAIL},
      {to: result.userEmail, subject: result.currentType.subject, body: htmlOutput});

    await transaction.commit();
    return result.token;
  } catch (error) {
    await transaction.rollback();

    // Conditional error handling
    if (error instanceof ErrorHandler) {
      throw error; // Re-throw specific error (403 in this case)
    }
    throw error;
  }
}
// login
// logout

/** 
 * =======
 *  RESET 
 * =======
 * **/
// reset
export async function resetService(token,user) {
  // get bearer token from header
  if(!token) {
    throw new ErrorHandler(401, "Token is required");
  }

  const transaction = await Database.transaction();
  try {
    // verify JWT token
    jwt.verify(token, process.env.VERIFY_KEY, function(err, decoded) {
      if(err) {
        throw new ErrorHandler(403, "Invalid or expired token");
      }
      // compare email
      if(decoded.userEmail !== user.userEmail) {
        throw new ErrorHandler(403, "Invalid or expired token");
      }
      user.userId = decoded.userId;
    })
    
    // update password
    await Users.update({userPassword: user.newPassword}, {where: {id: user.userId}}, {transaction});
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/** 
 * ===============
 *   VERIFY EMAIL 
 * ===============
 * **/
// verify code email & code reset password
export async function verifyService(token,user,type) {
  const currentType = requestType(type);

  // get bearer token from header
  if(currentType.value === "verify") {
    if(!token) {
      throw new ErrorHandler(401, "Verify Token is required");
    }
  }

  const transaction = await Database.transaction();
  try {
    // compare code and email from request
    const verify = await Verifies.findOne({where: {
      verifyCode: user.verifyCode, 
      verifyEmail: user.userEmail, 
      verifyType: currentType.value
    }});
    if(!verify) {
      throw new ErrorHandler(404, "Invalid verification code!");
    }

    // check verify userid is ecpired or not
    if (verify.expiredAt < new Date()) {
      throw new ErrorHandler(404, "Verification code is expired!");
    }

    // check verify token
    if (currentType.value === "verify") {
      if (token !== verify.verifyToken) {
        throw new ErrorHandler(401, "Invalid or expired token");
      }
      // verify JWT token
      jwt.verify(token, process.env.VERIFY_KEY, function(err, decoded) {
        if(err) {
          throw new ErrorHandler(403, "Invalid or expired token");
        }
      })
    }
    
    // update user
    await Users.update({isVerify: 1}, {where: {id: verify.userId}}, {transaction});
    
    // delete verify
    await Verifies.destroy({where: {userId: verify.userId}}, {transaction});
    
    await transaction.commit();
    // check verify type
    if (currentType.value === "reset") {
      // create jwt token
      const result = getCodeWithToken({userId: verify.userId,userEmail: verify.verifyEmail}, currentType, {expired: 10});
      return result.token;
    }
    return true;
  } catch (error) {
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
    const user = await Users.findOne({ where: { userEmail: email } });
    if (!user) {
      throw new ErrorHandler(403, "If your email is correct, verification code will be sent to your email");
    }

    // check if email is verify
    if (currentType.value === "verify") {
      if (user.isVerify) {
        throw new ErrorHandler(403, "Email already verify!");
      }
    }

    // check verify userid is ecpired or not
    const verify = await Verifies.findOne({ where: { userId: user.id } });
    if (verify) {
      // delete verify
      await Verifies.destroy({ where: { userId: user.id }, transaction });
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
    await Verifies.create(data, { transaction });

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
    await transaction.rollback();

    // Conditional error handling
    if (error instanceof ErrorHandler) {
      throw error; // Re-throw specific error (403 in this case)
    }
    throw error;
  }
}
