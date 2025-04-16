import { getAllLecturerService, getAllStudentService, getStudentByBatchAndCourseService, updateLecturerService } from "./../services/userServices.js";
/**
 * ========
 * USERS
 * --------
 * - Get all users (current batch)
 * - Get all lecturer (current batch)
 * - Update Lecturer by ID (Admin Only)
 * - Get all students (All Courses)
 * - Get all students (in batch and course)
 */

// Get all lecturer(current batch)
export async function getAllLecturer(req, res, next) {
  try {
    const lecturer = await getAllLecturerService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Get All Lecturer Successfuly",
      data: lecturer.data,
      paginate: lecturer.paginate
    });
  } catch (error) {
    next(error);
  }
}

// Get all students(All Courses)
export async function getAllStudent(req, res, next) {
  try {
    const student = await getAllStudentService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Get All Student Successfuly",
      data: student.data,
      paginate: student.paginate
    });
  } catch (error) {
    next(error);
  }
}

// Update Lecturer by ID (Admin Only)
export async function updateLecturer(req, res, next) {
  try {
    const lecturer = await updateLecturerService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Update Lecturer Successfuly",
      data: lecturer,
    });
  } catch (error) {
    next(error);
  }
}

// Get all students (in batch and course)
export async function getAllStudents(req, res, next) {
  try {
    const student = await getStudentByBatchAndCourseService({ req, res });
    res.status(200).json({
      statusCode: 200,
      message: "Get All Student by Batch and Course Successfuly",
      data: student.data,
      paginate: student.paginate
    });
  } catch (error) {
    next(error);
  }
}