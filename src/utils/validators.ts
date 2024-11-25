//my validator file
import Joi from 'joi'; // Import Joi for validation

// Schema for validating note creation
export const noteSchema = Joi.object({
  title: Joi.string().trim().max(50).required().messages({
    "string.max": "Title must not exceed 50 characters.",
    "any.required": "Title is required.",
  }),
  textdata: Joi.string().trim().max(300).required().messages({
    "string.max": "Textdata must not exceed 300 characters.",
    "any.required": "Textdata is required.",
  }),
});

// Schema for validating note updates
export const updateNoteSchema = Joi.object({
  title: Joi.string().trim().max(50).optional().messages({
    "string.max": "Title must not exceed 50 characters.",
  }),
  textdata: Joi.string().trim().max(300).optional().messages({
    "string.max": "Textdata must not exceed 300 characters.",
  }),
});


