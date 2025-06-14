import { ErrorHandler } from "./../exceptions/errorHandler.js";
import {  Database, CourseModel, UserModel } from "./../models/index.js";

/** 
 * ======
 *  COURSES 
 * ======
 * - Get All Courses
 * - Get Course By Id
 * - Create Course
 * - Update Course
 * - Delete Course
 * **/

// Get All Courses & Get Course By Id
export async function getCourseServices({req,res}){
  // check if request params
  if(req.params.id) {
    try {
      let courseId = parseInt(req.params.id) || null;
      if(typeof(courseId) !== "number") {
        throw new ErrorHandler(400, "Bad Request",[
          { parameter: "id", message: "Invalid course id" },
          { parameter: "id", message: "Id must be a number" }
        ])
      }

      // get course by id
      const course = await CourseModel.findOne({where: {id: courseId}})
      if(!course) {
        throw new ErrorHandler(404, "Not Found",[
          { parameter: "id", message: "Course not found" }
        ])
      }

      const data = {
        courseId: course.id,
        courseName: course.courseName,
        coordinatorId: null,
        coordinatorName: null
      }

      // check coordinatorId
      if(course.coordinatorId !== null){
        const course = await CourseModel.findOne(
          {
            where: { id: courseId },
            include: [
              {
                model: UserModel,
                as: "Coordinator",
                attributes: [["id", "coordinatorId"], ["name", "coordinatorName"]],
              }
            ]
          })
        if (!course) {
          throw new ErrorHandler(404, "Not Found", [
            { parameter: "id", message: "Course not found" }
          ])
        }
        data.coordinatorId = course.Coordinator.dataValues.coordinatorId;
        data.coordinatorName = course.Coordinator.dataValues.coordinatorName;
      }

      // return course
      return data;
    } catch (error) {
      console.log("GET COURSE BY ID ERROR: ", error);
      throw error;
    }
  }

  // check if request query
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  // set maximum limit is 20 
  (limit > 20)?limit=20:limit;

  try {
    // get all data limit with sequelize-paginate
    const courses = await CourseModel.paginate({ page, paginate: limit, order: [["created_at", "DESC"]] });
    const allCourse = await Promise.all( courses.docs.map(async(singleCourse)=>{
      if(singleCourse.coordinatorId === null){
        return {
          courseId:singleCourse.id,
          courseName:singleCourse.courseName,
          coordinatorId:singleCourse.coordinatorId,
          coordinatorName:null
        }
      }
      const user = await UserModel.findOne({where:{id:singleCourse.coordinatorId},attributes:[["id","coordinatorId"],["name","coordinatorName"]]})
      return {
        courseId: singleCourse.id,
        courseName: singleCourse.courseName,
        coordinatorId: user.dataValues.coordinatorId,
        coordinatorName: user.dataValues.coordinatorName
      }
    }));

    const result = {
      paginate:{
        currentPage: page,
        totalPages: courses.pages,
        totalItems: courses.total,
      },
      data: allCourse
    }
    
    // return result
    return result;
  } catch (error) {
    console.log("GET ALL COURSE ERROR: ", error);
    throw error;
  }
}

// Create Course
export async function createCourseService(courseName){
  const transaction = await Database.transaction();
  try {
    // check course name 
    const name =  await CourseModel.findOne({where:{courseName}})
    if(name){
      throw new ErrorHandler(409,"Conflict",[
        {field:"courseName", message:"Course name already exists!"}
      ])
    }
    
    // create course
    const course = await CourseModel.create({ courseName },{transaction});
    
    // commit transaction
    await transaction.commit();
    return {
      courseId:course.id,
      courseName:course.courseName,
      coordinatorId:null,
      coordinatorName:null
    }
  } catch (error) {
    console.log("CREATE COURSE ERROR: ",error);
    await transaction.rollback();
    throw error;
  }
}

// Update Course
export async function updateCourseService({req},courseRequest){
  let coordinator = null;
  const transaction = await Database.transaction();
  try {
    // check parameter id start 
    const courseId = parseInt(req.params.id) || null;
    if (!courseId) {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Required course ID" }
      ])
    }

    if (typeof (courseId) !== "number") {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Invalid course ID" },
        { parameter: "id", message: "Course ID must be a number" }
      ])
    }

    // check course 
    let singleCourse = await CourseModel.findOne({where:{id:courseId}});
    if(!singleCourse){
      throw new ErrorHandler(404,"Not Found",[
        {field:"courseId", message:"Invalid course ID"}
      ])
    }
    // end check parameter id

    const { coordinatorId = null, courseName } = courseRequest;
    if(coordinatorId===null){
      coordinator = { id: null};
    }

    // prepare return data
    const data = {
      coordinatorId: null,
      coordinatorName:null
    }

    if(coordinatorId){
      // check user id 
      coordinator = await UserModel.findOne({where:{id:coordinatorId}});
      if(!coordinator){
        throw new ErrorHandler(400,"Validation Error",[
          {field:"coordinatorId", message:"Invalid Coordinator ID"},
        ])
      }
      // check user verify or not 
      if(!coordinator.isVerify){
        throw new ErrorHandler(400,"Bad Request",[
          {field:"coordinatorId", message:"Coordinator ID is not verify"}
        ])
      }
      
      data.coordinatorId = coordinator.dataValues.id;
      data.coordinatorName = coordinator.dataValues.userName;
    }

    // update course
    await CourseModel.update({coordinatorId:coordinator.id, courseName, code},{where:{id: singleCourse.id}},{transaction});
    singleCourse = await CourseModel.findOne({ where: { id: courseId } });
    data.courseId = singleCourse.id;
    data.courseName = singleCourse.courseName;

    // transaction commit
    await transaction.commit();
    return data
  } catch (error) {
    console.log("UPDATE COURSE ERROR: ",error);
    // transaction rollback
    await transaction.rollback();
    throw error;
  }
}

// Delete Course (Optional)
export async function deleteCourseService({req}){
  const transaction = await Database.transaction();
  try {
    // check parameter id
    const courseId = parseInt(req.params.id) || null;
    if (!courseId) {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Required course ID" }
      ])
    }

    if (typeof (courseId) !== "number") {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Invalid course ID" },
        { parameter: "id", message: "Course ID must be a number" }
      ])
    }

    // check course
    const course = await CourseModel.findOne({where:{id:courseId}})
    if(!course){
      throw new ErrorHandler(400,"Bad Request",[
        {field:"courseId", message:"Invalid course ID"},
        {field:"courseId", message:"Course not found"},
      ])
    }

    // prepare return data
    const data = {
      courseId,
      courseName:course.courseName,
      coordinatorId:null,
      coordinatorName:null
    }

    if(course.coordinatorId !== null){
      const coordinator = await UserModel.findOne({where:{id:course.coordinatorId},attributes:[["id","coordinatorId"],["name","coordinatorName"]]});
      data.coordinatorId = coordinator.dataValues.coordinatorId;
      data.coordinatorName = coordinator.dataValues.coordinatorName;
    }
    // delete course
    await CourseModel.destroy({where:{id:courseId}},{transaction})
    
    // transaction commit
    await transaction.commit();
    return data;
  } catch (error) {
    console.log("DELETE COURSE ERROR: ",error);
    // transaction rollback
    await transaction.rollback();
    throw error;
  }
}