import Joi from "joi";

export const createCourseSchema = Joi.object({
  courseName: Joi.string().required(),
});

export const updateCourseSchema = Joi.object({
  courseName: Joi.string().optional(),
  coordinatorId: Joi.number().integer().optional(),
});
