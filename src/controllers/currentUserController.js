import { getCurrentUserService, updateCurrentUserPasswordService, updateCurrentUserService } from "./../services/currentUserServices.js";

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
export async function getCurrentUser(req,res,next){
  try {
    const user = await getCurrentUserService({req});
    res.status(200).json({
      statusCode:200,
      message:"Get Current User Successfuly",
      data:user
    })
  } catch (error) {
    next(error);
  }
}

// Update Current User
export async function updateCurrentUser(req,res,next){
  try {
    const user = await updateCurrentUserService({req},req.body);
    res.status(200).json({
      statusCode: 200,
      message: "Update Current User Successfuly",
      data: user
    })
  } catch (error) {
    next(error);
  }
}

// Update Current User Password
export async function updateCurrentUserPassword(req, res, next){
  try {
    const isChange = await updateCurrentUserPasswordService({req},req.body);
    if(isChange){
      res.status(200).json({
        statusCode: 200,
        message: "Your password has been changed!"
      });
    }
  } catch (error) {
    next(error);
  }
}