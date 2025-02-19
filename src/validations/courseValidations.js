import Joi from "joi";

export const createCourseSchema = Joi.object({
  courseName: Joi.string().required(),
});

export const updateCourseSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  courseName: Joi.string().optional(),
  coordinatorId: Joi.number().integer().optional(),
});

export const destroyCourseSchema = Joi.object({
  courseId: Joi.number().integer().required(),
});