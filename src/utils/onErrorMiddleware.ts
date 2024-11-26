import { createErrorResponse } from './errorHandler';

// Customized error messages interface
interface ErrorMessages {
  validation?: string;
  internal?: string;
}

// Middleware that catches errors and returns a consistent error response
export const onErrorMiddleware = (customErrorMessages: ErrorMessages = {}) => ({
  onError: async (request) => {
    const { error } = request;

    // Log the full error for debugging
    console.error('Error Middleware Triggered:', JSON.stringify(error, null, 2));

    // Catch validation errors
    if (error?.name === 'SchemaValidationError') {
      const message = customErrorMessages.validation || 'Validation error. Please check your input.';
      request.response = createErrorResponse(400, message);
      return;
    }

    // Catch any other errors
    const message = customErrorMessages.internal || 'Internal Server Error';
    console.error('Unhandled error:', error?.message || 'Unknown error');
    request.response = createErrorResponse(500, message);
  },
});
