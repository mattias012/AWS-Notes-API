// utils/onErrorMiddleware.ts

import { createErrorResponse } from './errorHandler';

//customized error messages interface
interface ErrorMessages {
  validation?: string;
  internal?: string;
}

// Middleware that catches errors and returns a consistent error response
export const onErrorMiddleware = (customErrorMessages: ErrorMessages = {}) => ({
  onError: async (request) => {
    const { error } = request;

    //catch validation errors
    if (error.name === 'SchemaValidationError') {
      const message = customErrorMessages.validation || 'Validation error. Please check your input.';
      request.response = createErrorResponse(400, message);
      return;
    }

    //catch any other errors
    console.error('Unhandled error:', error);
    const message = customErrorMessages.internal || 'Internal Server Error';
    request.response = createErrorResponse(500, message);
  },
});
