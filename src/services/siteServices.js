/**
 * ========
 * SITE MAINTENANCE
 * --------
 * - Site update
 */

import { withTransaction } from "./../utils/withTransaction.js";
import { SiteDetailModel } from "./../models/index.js";

export async function UpdateSiteService({req, res}) {
  const {title, textHeader, description} = req.body;

  return await withTransaction(async (transaction) => {
    await SiteDetailModel.update(
      { title, textHeader, description },
      { where: {id:1}, transaction });
    const newData = await SiteDetailModel.findByPk(1,{ 
      attributes: {
        exclude: ["createdAt", "updatedAt"]
       },
      transaction
    });
    return newData;
  },{ ERROR_MESSAGE: "Update Site Failed" });
}