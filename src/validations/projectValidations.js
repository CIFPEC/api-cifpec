import Joi from "joi";

export const createProjectSchema = Joi.object({
  projectName: Joi.string().required(),
  teams: Joi.array()
    .items(
      Joi.number().integer().required().messages({
        "number.base": "Each team ID must be a number",
        "number.integer": "Each team ID must be an integer",
        "any.required": "Each team ID is required",
      })
    )
    .min(2)
    .required()
    .messages({
      "array.base": "Teams must be an array",
      "array.min": "At least 2 team is required",
    }),
  supervisorId: Joi.number().integer().required().messages({
    "number.base": "Supervisor ID must be a number",
    "number.integer": "Supervisor ID must be an integer",
    "any.required": "Supervisor ID is required",
  }),
});