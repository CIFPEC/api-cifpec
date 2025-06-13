import Joi from "joi";
import { getRole } from "./../../utils/helper.js";
const role = getRole();

/** 
 * ====== 
 *  AUTH
 * ======
 */
// register
export const registerSchema = Joi.object({
  userEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format.',
      'any.required': 'Email is required.',
    }),
  userPassword: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[_@$!%*?&])[A-Za-z\\d_@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
      'string.min': 'Password must be at least 8 characters.',
      'string.max': 'Password must not exceed 32 characters.',
      'any.required': 'Password is required.',
    }),
  retypePassword: Joi.string()
    .valid(Joi.ref('userPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Retype password is required.',
    }),
  roleId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Role ID must be a number.',
      'any.required': 'Role ID is required.',
    }),
  courseId: Joi.number()
    .integer()
    .when('roleId', {
      is: Joi.valid(role.STUDENT, role.COORDINATOR, role.SUPERVISOR),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .required()
    .messages({
      'number.base': 'Course ID must be a number.',
      'any.required': 'Course ID is required.',
    }),
});

// login
export const loginSchema = Joi.object({
  userEmail: Joi.string().required()
  .custom((value, helpers) => {
    const isEmail = Joi.string().email().validate(value).error === undefined;
    const isPhone = /^[0-9]{10,13}$/.test(value); // Regex untuk phone number (10-13 digit)
    const isUsername = /^[a-zA-Z0-9._-]{3,30}$/.test(value); // Regex untuk username (3-30 chars, alphanumeric + _ . -)
    
    if (isEmail || isPhone || isUsername) {
      return value;
    } 
    return helpers.error('any.invalid',{value});
  },'Custom Validation Error')
    .message({'any.invalid':'Invalid email or phone number or username'
  }),
  userPassword: Joi.string().required(),
});

/** 
 * ====== 
 *  RESET
 * ======
 */
// reset
export const resetSchema = Joi.object({
  userEmail: Joi.string().email().required()
  .messages({
    'any.required': 'Email is required.',
    'string.email': 'Invalid email format.',
  }),
  newPassword: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[_@$!%*?&])[A-Za-z\\d_@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
      'string.min': 'Password must be at least 8 characters.',
      'string.max': 'Password must not exceed 32 characters.',
      'any.required': 'Password is required.',
    }),
  retypePassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Retype password is required.',
    }),
})

/** 
 * ====== 
 *  VERIFY
 * ======
 */
// request verify code & reset code
export const requestCodeSchema = Joi.object({
  userEmail: Joi.string().email().required()
  .messages({
    'string.email': 'Invalid email format.',
    'any.required': 'Email is required.',
  })
})
// verify reset code & verify email code
export const verifySchema = Joi.object({
  verifyCode: Joi.string().required(),
  userEmail: Joi.string().email().required()
  .messages({
    'string.email': 'Invalid email format.',
    'any.required': 'Email is required.',
  })
})

/**
 * ================
 * CURRENT USER
 * ================
 * - update current user
 * - update current user password
 */
// update current user
export const updateCurrentUserSchema = Joi.object({
  userEmail: Joi.string().email().optional().messages({
    'string.email': 'Invalid email format.',
  }),
  userName: Joi.string().required(),
  userUsername: Joi.string().min(3).required(),
  userGender: Joi.string().valid("Male", "Female").required().messages({
    'string.base': 'Gender must be a string.',
    'any.required': 'Gender is required.',
    "any.only": 'Gender must be either "Male" or "Female".',
  }),
  userPhone: Joi.string().pattern(/^\d{10,}$/).required().messages({
    'number.base': 'Phone number must be a number.',
    'string.pattern.base': 'Phone number must be at least 10 digits.',
  }),
  nric: Joi.string().pattern(/^\d{12}$/).required().messages({
    'number.base': 'NRIC must be a number.',
    'string.pattern.base': 'NRIC must be exactly 12 digits.',
  }),
});

// update current user password
export const updateCurrentUserPasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[_@$!%*?&])[A-Za-z\\d_@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
      'string.min': 'Password must be at least 8 characters.',
      'string.max': 'Password must not exceed 32 characters.',
      'any.required': 'Password is required.',
    }),
  retypePassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Retype password is required.',
    }),
});

// Update Lecturer by ID(Admin Only)
export const updateLecturerSchema = Joi.object({
  isActive: Joi.boolean().optional(),
  isApproved: Joi.boolean().optional(),
})