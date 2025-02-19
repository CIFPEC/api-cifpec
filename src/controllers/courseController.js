import { createCourseService, deleteCourseService, getCourseServices, updateCourseService } from "./../services/courseServices.js";

/** 
 * ======
 *  COURSES 
 * ======
 * **/

// Get All Courses
export async function getAllCourses(req,res,next){
  try {
    const courses = await getCourseServices({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get course successfuly!",
      data:courses.data,
      paginate:courses.paginate
    });
  } catch (error) {
    next(error);
  }
}

// Create Course
export async function createCourses(req,res,next){
  try {
    const course = await createCourseService(req.body.courseName);
    res.status(200).json({
      statusCode:200,
      message:"Course created successfully!",
      data:course
    })
  } catch (error) {
    next(error)
  }
}

// Get Course By Id
export async function getCourseById(req, res, next){
  try {
    const course = await getCourseServices({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get course detail successfuly!",
      data:course
    })
  } catch (error) {
    next(error);
  }
}

// Update Course
export async function updateCourseById(req, res, next){
  try {
    const course = await updateCourseService(req.body);
    res.status(200).json({
      statusCode:200,
      message:"Get course detail successfuly!",
      data:course
    })
  } catch (error) {
    next(error);
  }
}

// Delete Course (Optional)
export async function destroyCourseById(req,res,next){
  try {
    const course = await deleteCourseService(req.body.courseId);
    res.status(200).json({
      statusCode:200,
      message:"Course delete successfuly!",
      data:course
    })
  } catch (error) {
    next(error);
  }
}