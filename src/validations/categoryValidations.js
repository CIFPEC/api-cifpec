import Joi from "joi";

export const createCategorySchema = Joi.object({
  categoryName: Joi.string().required(),
});

export const updateCategorySchema = Joi.object({
  categoryName: Joi.string().optional(),
  categoryCode: Joi.string().optional(),
});
