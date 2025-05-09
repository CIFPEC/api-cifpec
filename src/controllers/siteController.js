import { UpdateSiteService } from "../services/siteServices.js";

/**
 * ========
 * SITE MAINTENANCE
 * --------
 * - Site update
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
