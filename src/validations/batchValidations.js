import Joi from "joi";

export const createAndUpdateBatchSchema = Joi.object({
  batchName: Joi.string().required().messages({
    "any.required": "Batch name is required",
    "string.empty": "Batch name cannot be empty",
  }),
  lastUpdate: Joi.date().timestamp().optional().messages({
    "date.base": "Last update must be a valid timestamp",
  }),
  isFinal: Joi.boolean().optional(),
  startDate: Joi.date().timestamp().optional().allow(null),
  endDate: Joi.date().timestamp().optional().allow(null),
  courses: Joi.array()
    .items(Joi.number().integer().positive().required().messages({
      "number.base": "Each course ID must be a number",
      "number.positive": "Course ID must be a positive number",
      "any.required": "Course ID is required",
    }))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one course is required",
      "number.base": "Each course ID must be a number",
    }),
  projectRequirements: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().required().messages({
          "any.required": "Label is required",
          "string.empty": "Label cannot be empty",
        }),
        type: Joi.alternatives()
          .try(Joi.string(), Joi.number().integer())
          .required()
          .messages({
            "any.required": "Type is required",
            "alternatives.match":
              "Type must be either a string or an integer",
          }),
        required: Joi.boolean().optional().messages({
          "boolean.base": "Required must be a boolean",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Project requirements must be an array",
      "array.min": "At least one project requirement is required",
    }),
});

