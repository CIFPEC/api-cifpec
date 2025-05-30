import { getRoleService } from "../services/roleServices.js";

/**
 * ========
 * ROLES
 * --------
 * - get roles
 */

// site update
export async function getAllRoles(req, res, next) {
  try {
    const roles = await getRoleService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Get Roles Successfuly",
      data: roles
    });
  } catch (error) {
    next(error);
  }
}

