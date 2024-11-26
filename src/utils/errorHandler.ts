//error messages
export const ERROR_MESSAGES = {
    MISSING_TITLE: "Title is required.",
    MISSING_TEXTDATA: "Textdata is required.",
    MISSING_NOTE_ID: "Note ID is required.",
    INVALID_EMAIL_FORMAT: "Invalid email format.",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
    USER_EXISTS: "User with this email already exists.",
    NOTE_NOT_FOUND: "Note not found.",
    INVALID_PROPERTIES: "Invalid additional properties in request body.",
    GENERAL_VALIDATION_ERROR: "Validation error. Please check your input.",
  };
  
  // Create a consistent error response
  export const createErrorResponse = (statusCode: number, message: string) => {
    return {
      statusCode,
      body: JSON.stringify({ message }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  };
  