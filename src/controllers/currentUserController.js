import { getCurrentUserService } from "./../services/currentUserServices.js";

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