import { getSiteService, UpdateSiteService } from "../services/siteServices.js";

/**
 * ========
 * SITE MAINTENANCE
 * --------
 * - Site update
 * - Get Site data
 */

// site update
export async function siteUpdate(req, res, next) {
  try {
    const site = await UpdateSiteService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Update Site Successfuly",
      data: site
    });
  } catch (error) {
    next(error);
  }
}

// get site data
export async function getSite(req,res,next){
  try {
    const site = await getSiteService({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get site data successfuly",
      data: site
    })
  } catch (error) {
    next(error);
  }
}
