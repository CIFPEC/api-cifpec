import { generateCategoryCode } from "../utils/generateCategoryCode.js";
import { ErrorHandler } from "./../exceptions/errorHandler.js";
import {  Database, CourseModel, UserModel, CategoryModel } from "./../models/index.js";

/** 
 * ======
 *  CATEGORIES 
 * ======
 * - Get All Categories
 * - Get Category By Id
 * - Create Cetegory
 * - Update Category
 * - Delete Category
 * **/

// Get All Categories & Get Category By Id
export async function getCategoryServices({req,res}){
  // check if request params
  if(req.params.id) {
    try {
      let categoryId = parseInt(req.params.id) || null;
      if (typeof (categoryId) !== "number") {
        throw new ErrorHandler(400, "Bad Request",[
          { parameter: "id", message: "Invalid category id" },
          { parameter: "id", message: "Id must be a number" }
        ])
      }

      // get category by id
      const category = await CategoryModel.findByPk(categoryId)
      if (!category) {
        throw new ErrorHandler(404, "Not Found",[
          { parameter: "id", message: "Category not found" }
        ])
      }

      const data = {
        categoryId: category.id,
        categoryName: category.categoryName,
        categoryCode: category.categoryCode
      }

      // return category
      return data;
    } catch (error) {
      console.log("GET CATEGORY BY ID ERROR: ", error);
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
    const categories = await CategoryModel.paginate({ page, paginate: limit, order: [["createdAt", "DESC"]] });
    const allCategories = await Promise.all(categories.docs.map(async(singleCategory)=>{
      return {
        categoryId: singleCategory.id,
        categoryName: singleCategory.categoryName,
        categoryCode: singleCategory.categoryCode
      }
    }));

    const result = {
      paginate:{
        currentPage: page,
        totalPages: categories.pages,
        totalItems: categories.total,
      },
      data: allCategories
    }
    
    // return result
    return result;
  } catch (error) {
    console.log("GET ALL CATEGORIES ERROR: ", error);
    throw error;
  }
}

// Create Category
export async function createCategoryService(categoryName){
  const transaction = await Database.transaction();
  try {
    // check course name 
    const name =  await CategoryModel.findOne({where:{categoryName}})
    if(name){
      throw new ErrorHandler(409,"Conflict",[
        {field:"categoryName", message:"Category name already exists!"}
      ])
    }
    
    // generate category code
    let categoryCode = generateCategoryCode(categoryName);
    let originalCode = categoryCode;

    let unix = 1;
    while (await CategoryModel.findOne({where:{categoryCode}})) {
      categoryCode = `${originalCode}${unix}`;
      unix++;
    }
    
    // create category
    const category = await CategoryModel.create({ categoryName, categoryCode },{transaction});
    
    // commit transaction
    await transaction.commit();
    return {
      categoryId: category.id,
      categoryName: category.categoryName,
      categoryCode: category.categoryCode
    }
  } catch (error) {
    console.log("CREATE CATEGORIES ERROR: ",error);
    await transaction.rollback();
    throw error;
  }
}

// Update Category
export async function updateCategoryService({req}){
  const transaction = await Database.transaction();
  try {
    // check parameter id start 
    const categoryId = parseInt(req.params.id) || null;
    if (!categoryId) {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Required category ID" }
      ])
    }

    if (typeof (categoryId) !== "number") {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Invalid category ID" },
        { parameter: "id", message: "Category ID must be a number" }
      ])
    }

    // check course 
    let singleCategory = await CategoryModel.findByPk(categoryId);
    if(!singleCategory){
      throw new ErrorHandler(404,"Not Found",[
        {field:"categoryId", message:"Invalid category ID"}
      ])
    }
    // end check parameter id

    const { categoryName, categoryCode } = req.body;

    // prepare return data
    const data = {}

    if (req.body.hasOwnProperty("categoryName") && categoryName !== singleCategory.categoryName){
      data.categoryName = categoryName;
      
      // generate course categoryCode
      let code = generateCategoryCode(categoryName);
      let originalCode = code;
  
      let unix = 1;
      while (await CategoryModel.findOne({ where: { categoryCode: code } })) {
        code = `${originalCode}${unix}`;
        unix++;
      }
  
      data.categoryCode = code;
    }

    if (req.body.hasOwnProperty("categoryCode") && !req.body.hasOwnProperty("categoryName")) {
      data.categoryCode = categoryCode;
    }

    if (req.body.hasOwnProperty("categoryName") && req.body.hasOwnProperty("categoryCode")) {
      data.categoryName = categoryName;
      data.categoryCode = categoryCode;  
    }

    // update course
    await CategoryModel.update(data,{where:{id: singleCategory.id}},{transaction});
    singleCategory = await CategoryModel.findByPk(singleCategory.id,{transaction});
    data.categoryId = singleCategory.id;
    data.categoryName = singleCategory.categoryName;
    data.categoryCode = singleCategory.categoryCode;

    // transaction commit
    await transaction.commit();
    return data
  } catch (error) {
    console.log("UPDATE CATEGORIES ERROR: ",error);
    // transaction rollback
    await transaction.rollback();
    throw error;
  }
}

// Delete Category (Optional)
export async function deleteCategoryService({req}){
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