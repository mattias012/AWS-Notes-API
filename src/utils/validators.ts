//my validator file
import Joi from 'joi';

// Define Joi schema for note validation
export const noteSchema = Joi.object({
  title: Joi.string().max(50).required().messages({
    "string.max": "Title must not exceed 50 characters.",
    "any.required": "Title is required.",
  }),
  textdata: Joi.string().max(300).required().messages({
    "string.max": "Textdata must not exceed 300 characters.",
    "any.required": "Textdata is required.",
  }),
});

// Define Joi schema for updating note
export const updateNoteSchema = Joi.object({
  title: Joi.string().max(50).optional().messages({
    "string.max": "Title must not exceed 50 characters.",
  }),
  textdata: Joi.string().max(300).optional().messages({
    "string.max": "Text must not exceed 300 characters.",
  }),
});

// Define Joi schema for login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
  }),
});

// Define Joi schema for signup validation
export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long.",
    "any.required": "Password is required.",
  }),
});

