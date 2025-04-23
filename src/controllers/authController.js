import { renewAccessTokenService } from "./../services/resfreshTokenService.js";
import { loginService, logoutService, registerService, requestCodeService, resetService, verifyService } from "./../services/authServices.js";

/** 
 * ======
 *  AUTH 
 * ======
 * **/
// register
export async function register(req, res,next) {
  try {
    const data = await registerService(req.body);
    res.json({ 
      statusCode: 200,
      message: "Registration successful, Please verify your email",
      data
     });
  } catch (error) {
    next(error);
  }
}
// login
export async function login(req, res,next) {
  try {
    const token = await loginService({req,res},req.body);
    if(Array.isArray(token)){
      res.json({
        statusCode: 200,
        message: "You're already logged in!",
      })
    }else{
      res.json({
        statusCode: 200,
        message: "Login successful. Welcome back!",
        data: {token}
      })
    }
  } catch (error) {
    next(error);
  }
}
// logout
export async function logout(req, res,next) {
  try {
    await logoutService(req,res);
    res.status(200).json({
      statusCode: 200,
      message: "Logout successful"
    })
  } catch (error) {
    next(error);
  }
}

/** 
 * ======
 *  RESET 
 * ======
 * **/
// request code
export async function requestCodeReset(req, res, next) {
  const { userEmail } = req.body;
  try {
    const data = await requestCodeService(userEmail, 'password_reset_request');
    res.status(200).json({
      statusCode: 200,
      message: "Verification code sent successfully, please check your email",
      data,
    });
  } catch (error) {
    next(error);
  }
}
// verify
export async function verifyReset(req, res, next) {

  try {
    const token = await verifyService(null, req.body, 'password_reset');
    res.status(200).json({
      statusCode: 200,
      message: "Code verified successfully. You may now change your password.",
      data: token
    });
  } catch (error) {
    next(error);
  }
}
// reset
export async function reset(req, res, next) {
  const token = req.headers["reset-token"];
  try {
    await resetService(token, req.body);
    res.status(200).json({
      statusCode: 200,
      message: "Password changed successfully"
    })
  } catch (error) {
    next(error);
  }
}

/** 
 * ===============
 * VERIFY EMAIL 
 * ===============
 * */
// resend or request code
export async function requestCodeVerifyEmail(req, res, next) {
  const { userEmail } = req.body;
  try {
    const data = await requestCodeService(userEmail,'email_verification');
    res.status(200).json({
      statusCode: 200,
      message: "Verification code sent successfully, please check your email",
      data,
    });
  } catch (error) {
    next(error);
  }
}
// verify
export async function verifyEmail(req, res, next) {
  const verifyToken = req.headers["verify-token"];
  try {
    const token = await verifyService(verifyToken, req.body, 'email_verification',{req,res});
    res.status(200).json({
      statusCode: 200,
      message: "Email verified successfully",
      data: {token},
    });
  } catch (error) {
    next(error);
  }
}


/** 
 * ===============
 * RENEW TOKEN 
 * ===============
 * */
// renew token
export async function renewToken(req, res, next) {
  try {
    const token = await renewAccessTokenService(req,res);
    res.status(200).json({
      statusCode: 200,
      message: "Renew token successful",
      data: {token}
    })
  } catch (error) {
    next(error);
  }
}