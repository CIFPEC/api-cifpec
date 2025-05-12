/**
 * ========
 * SITE MAINTENANCE
 * --------
 * - Site update
 */

import { withTransaction } from "./../utils/withTransaction.js";
import { SiteDetailModel } from "./../models/index.js";
import fs from 'fs/promises';
import path from "path";
import { checkIfExists } from "../utils/helper.js";

export async function UpdateSiteService({req, res}) {
  const {title, textHeader, description} = req.body;
  const siteFile = {};
  if(req.files && req.files.length > 0) {
    for(const file of req.files) {
      if(file.fieldname === "logo") {
        siteFile.logo = file.filename;
      }
      if(file.fieldname === "banner") {
        siteFile.banner = file.filename;
      }
    }
  }
  
  return await withTransaction(async (transaction) => {
    const siteData = await SiteDetailModel.findByPk(1,{ transaction });
    // check existing logo
    if (siteFile.logo && siteData.logo) {
      const oldLogoPath = path.join(process.cwd(), "public", "uploads", "site-settings", siteData.logo);
      const exists = await checkIfExists(oldLogoPath);
      if (exists) {
        await fs.unlink(oldLogoPath);
      }
    }
    
    // check existing banner
    if(siteFile.banner && siteData.banner) {
      const oldBannerPath = path.join(process.cwd(), "public", "uploads", "site-settings", siteData.banner);
      const exists = await checkIfExists(oldBannerPath);
      if (exists) {
        await fs.unlink(oldBannerPath);
      }
    }

    await SiteDetailModel.update(
      { title, textHeader, description, ...siteFile },
      { where: {id:1}, transaction });
    const newData = await SiteDetailModel.findByPk(1,{ 
      attributes: {
        exclude: ["id", "createdAt", "updatedAt"]
       },
      transaction
    });
    return newData;
  },{ ERROR_MESSAGE: "Update Site Failed" });
}