import { getDashboardService } from "../services/dashboardServices.js";

export async function getDashboard(req,res,next) {
  try {
    const dashboard = await getDashboardService({req,res});
    res.status(200).json({
      statusCode: 200,
      message: "Get dashboard successfuly!",
      data: dashboard
    })
  } catch (error) {
    next(error);
  }
}