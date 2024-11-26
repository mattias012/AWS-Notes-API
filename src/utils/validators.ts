//This is my validator file
//It is used to validate the incoming request body and path parameters
//It uses the JSON Schema format to define the structure of the request
//used together with the @middy/validator middleware

// JSON Schema for creating a note
export const createNoteSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 50,
          errorMessage: {
            maxLength: "Title must not exceed 50 characters.",
            type: "Title is required and must be a string.",
          },
        },
        textdata: {
          type: "string",
          maxLength: 300,
          errorMessage: {
            maxLength: "Textdata must not exceed 300 characters.",
            type: "Textdata is required and must be a string.",
          },
        },
      },
      required: ["title", "textdata"],
      additionalProperties: false,
      errorMessage: {
        required: {
          title: "Title is required.",
          textdata: "Textdata is required.",
        },
        additionalProperties: "Invalid additional properties in request body.",
      },
    },
  },
  required: ["body"],
  additionalProperties: false,
};

// JSON Schema for deleting a note
export const deleteNoteSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        noteId: { type: "string" },
      },
      required: ["noteId"],
    },
  },
  required: ["pathParameters"],
};

// JSON Schema for getting a note
export const getNoteSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        noteId: { type: "string" },
      },
      required: ["noteId"],
    },
  },
  required: ["pathParameters"],
};

// JSON Schema for login
export const loginSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          errorMessage: {
            format: "Invalid email format.",
            type: "Email is required and must be a string.",
          },
        },
        password: {
          type: "string",
          minLength: 1,
          errorMessage: {
            minLength: "Password is required.",
            type: "Password is required and must be a string.",
          },
        },
      },
      required: ["email", "password"],
      additionalProperties: false,
      errorMessage: {
        required: {
          email: "Email is required.",
          password: "Password is required.",
        },
        additionalProperties: "Invalid additional properties in request body.",
      },
    },
  },
  required: ["body"],
};
// JSON Schema for restoring a note
export const restoreNoteSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        noteId: { type: "string" },
      },
      required: ["noteId"],
    },
  },
  required: ["pathParameters"],
};
// JSON Schema for signup
export const signupSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          errorMessage: {
            format: "Invalid email format.",
            type: "Email is required and must be a string.",
          },
        },
        password: {
          type: "string",
          minLength: 8,
          errorMessage: {
            minLength: "Password must be at least 8 characters long.",
            type: "Password is required and must be a string.",
          },
        },
      },
      required: ["email", "password"],
      additionalProperties: false,
      errorMessage: {
        required: {
          email: "Email is required.",
          password: "Password is required.",
        },
        additionalProperties: "Invalid additional properties in request body.",
      },
    },
  },
  required: ["body"],
};
// JSON Schema for updating a note
export const updateNoteSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 50,
          errorMessage: {
            maxLength: "Title must not exceed 50 characters.",
          },
        },
        textdata: {
          type: "string",
          maxLength: 300,
          errorMessage: {
            maxLength: "Textdata must not exceed 300 characters.",
          },
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties: "Invalid additional properties in request body.",
      },
    },
    pathParameters: {
      type: "object",
      properties: {
        noteId: { type: "string" },
      },
      required: ["noteId"],
    },
  },
  required: ["body", "pathParameters"],
};
