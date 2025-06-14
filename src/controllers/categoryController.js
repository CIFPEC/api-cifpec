import { createCategoryService, getCategoryServices, updateCategoryService } from "../services/categoryServices.js";

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

// Get All Categories
export async function getAllCategories(req,res,next){
  try {
    const categories = await getCategoryServices({req,res});
    res.status(200).json({
      statusCode:200,
      message:"Get category successfuly!",
      data:categories.data,
      paginate:categories.paginate
    });
  } catch (error) {
    next(error);
  }
}

// Create Category
export async function createCategory(req,res,next){
  try {
    const category = await createCategoryService(req.body.categoryName);
    res.status(200).json({
      statusCode:200,
      message:"Category created successfully!",
      data:category
    })
  } catch (error) {
    next(error)
  }
}

// Get Category By ID
export async function getCategoryById(req, res, next){
  try {
    const category = await getCategoryServices({ req, res });
    res.status(200).json({
      statusCode:200,
      message:"Get category detail successfuly!",
      data:category
    })
  } catch (error) {
    next(error);
  }
}

// Update Category
export async function updateCategoryById(req, res, next){
  try {
    const category = await updateCategoryService({ req });
    res.status(200).json({
      statusCode:200,
      message:"Category update successfuly!",
      data:category
    })
  } catch (error) {
    next(error);
  }
}

// Delete Category (Optional)
export async function destroyCategoryById(req,res,next){
  try {
    res.status(200).json({
      statusCode:200,
      message:"category delete successfuly!",
      data:{}
    })
  } catch (error) {
    next(error);
  }
}