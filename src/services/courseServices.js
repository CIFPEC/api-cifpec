import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { Courses, Database, Users } from "./../models/index.js";

/** 
 * ======
 *  COURSES 
 * ======
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
      const course = await Courses.findOne({where: {id: courseId}})
      if(!course) {
        throw new ErrorHandler(404, "Not Found",[
          { parameter: "id", message: "Course not found" }
        ])
      }

      // return course
      return {
        courseId: course.id,
        courseName: course.courseName,
        coordinatorId: course.coordinatorId
      }
    } catch (error) {
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
    const courses = await Courses.paginate({page,paginate:limit});
    const allCourse = courses.docs.map((singleCourse)=>({
      courseId:singleCourse.id,
      courseName:singleCourse.courseName,
      coordinatorId:singleCourse.coordinatorId
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
    throw error;
  }
}

// Create Course
export async function createCourseService(courseName){
  const transaction = await Database.transaction();
  try {
    // check course name 
    const name =  await Courses.findOne({where:{courseName}})
    if(name){
      throw new ErrorHandler(409,"Conflict",[
        {field:"courseName", message:"Course name already exists!"}
      ])
    }
    
    // create course
    const course = await Courses.create({courseName},{transaction});
    
    // commit transaction
    await transaction.commit();
    return {
      courseId:course.id,
      courseName:course.courseName,
      coordinatorId:null
    }
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Update Course
export async function updateCourseService(course){
  const transaction = await Database.transaction();
  try {
    // check course 
    let singleCourse = await Courses.findOne({where:{id:course.courseId}});
    if(!singleCourse){
      throw new ErrorHandler(404,"Not Found",[
        {field:"courseId", message:"Invalid course ID"}
      ])
    }

    // check user id 
    const coordinator = await Users.findOne({where:{id:course.coordinatorId}});
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

    // update course
    await Courses.update({coordinatorId:coordinator.id, courseName:coordinator.courseName},{where:{id: singleCourse.id}},{transaction});
    singleCourse = await Courses.findOne({ where: { id: course.courseId } });

    // transaction commit
    await transaction.commit();
    return {
      courseId: singleCourse.id,
      courseName: singleCourse.courseName,
      coordinatorId: singleCourse.coordinatorId
    }
  } catch (error) {
    // transaction rollback
    await transaction.rollback();
    throw error;
  }
}

// Delete Course (Optional)
export async function deleteCourseService(courseId){
  const transaction = await Database.transaction();
  try {
    const course = await Courses.findOne({where:{id:courseId}})
    if(!course){
      throw new ErrorHandler(400,"Bad Request",[
        {field:"courseId", message:"Invalid course ID"},
        {field:"courseId", message:"Course not found"},
      ])
    }
    await Courses.destroy({where:{id:courseId}},{transaction})
    
    // transaction commit
    await transaction.commit();
    return {
      courseId,
      courseName:course.courseName,
      coordinatorId:course.coordinatorId
    };
  } catch (error) {
    // transaction rollback
    await transaction.rollback();
    throw error;
  }
}