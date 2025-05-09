import Joi from "joi";

export const updateSiteSchema = Joi.object({
  title: Joi.string().optional(),
  // logo: Joi.string().optional(),
  // banner: Joi.string().optional(),
  textHeader: Joi.string().optional(),
  description: Joi.string().optional(),
});