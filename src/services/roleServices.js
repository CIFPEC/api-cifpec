import { withTransaction } from "./../utils/withTransaction.js";
import { RoleModel } from "./../models/index.js";

/**
 * ========
 * ROLES
 * --------
 * - get roles
 */


// get roles
export async function getRoleService({req,res}) {
  return await withTransaction(async (transaction) => {
    const roles = await RoleModel.findAll({
      attributes: {
        exclude: ["id", "createdAt", "updatedAt"],
        include: [["id", "roleId"]]
       },
      transaction
    });
    return roles;
  }, { ERROR_MESSAGE: "Get Roles Failed" });
}