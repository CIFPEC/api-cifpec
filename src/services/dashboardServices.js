import { ErrorHandler } from "../exceptions/errorHandler.js";
import { BatchModel, CourseModel, ProjectArchiveModel, ProjectModel, UserDetailModel, UserModel } from "../models/index.js";
import { getProtocol, getRole } from "../utils/helper.js";
import { withTransaction } from "../utils/withTransaction.js";

export async function getDashboardService({req, res}){
  const ROLE = getRole();
  return await withTransaction(async (transaction) => {
    const totalStudents = await UserModel.count({ where: { roleId: ROLE.STUDENT },transaction });
    const totalSupervisors = await UserModel.count({ where: { roleId: ROLE.SUPERVISOR },transaction });
    const totalCoordinators = await UserModel.count({ where: { roleId: ROLE.COORDINATOR },transaction });
    const totalArchiveProjects = await ProjectArchiveModel.count({transaction});
    const totalCurrentProjects = await ProjectModel.count({transaction});

    const latestBatch = await BatchModel.findOne({
      order: [['created_at', 'DESC']],
      transaction
    });
    if (!latestBatch){
      console.log("ERROR: ","Batch not found");
      throw new ErrorHandler(500, "Internal Server Error");
    } 
    const currentBatchId = latestBatch.id;
    const totalStudentsInBatch = await UserDetailModel.count({ where: { batchId: currentBatchId },transaction });
    const totalProjectsInBatch = await ProjectModel.count({ where: { batchId: currentBatchId },transaction });

    const getCurrentStudentDetails = await UserModel.findAll({
      attributes: ['userName'],
      include: {
        model: UserDetailModel,
        as: 'Profile',
        attributes: ['userProfileImage'],
        where: { batchId: currentBatchId },
        include: {
          model: CourseModel,
          as: 'EnrolledCourse',
          attributes: [['name', 'courseName']]
        }
      },
      where: { roleId: ROLE.STUDENT },
      transaction,
      limit: 10
    });

    const studentLists = getCurrentStudentDetails.map((student) => {
      return {
        userName: student?.userName || null,
        userProfileImage: student?.Profile?.userProfileImage ? getProtocol(req,"profile",student?.Profile?.userProfileImage) : null,
        courseName: student?.Profile?.EnrolledCourse?.courseName
      }
    });

    return {
      totalStudents,
      totalProjects: totalCurrentProjects + totalArchiveProjects,
      totalStudentsInBatch,
      totalProjectsInBatch,
      totalSupervisors,
      totalCoordinators,
      studentLists
    };

  }, { ERROR_MESSAGE: "Get Dashboard Failed" });
}