import { processFile } from '../utils/uploader.js';


export async function siteSetting(req,res,next){
  try {
    processFile({ req, res, next },["image/png", "image/jpeg", "image/jpg"]);
  } catch (error) {
    next(error);
  }
}