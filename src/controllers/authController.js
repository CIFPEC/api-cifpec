import { registerService, requestCodeService, resetService, verifyService } from "./../services/authServices.js";

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
export async function login(req, res) {
  
}
// logout

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
    await verifyService(verifyToken, req.body, 'email_verification');
    res.status(200).json({
      statusCode: 200,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
}