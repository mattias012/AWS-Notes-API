//This is my validator file
//It is used to validate the incoming request body and path parameters
//It uses the JSON Schema format to define the structure of the request
//used together with the @middy/validator middleware

/// JSON Schema for creating a note
export const createNoteSchema = {
    type: "object",
    properties: {
      body: {
        type: "object",
        properties: {
          title: {
            type: "string",
            maxLength: 50,
          },
          textdata: {
            type: "string",
            maxLength: 300,
          },
        },
        required: ["title", "textdata"], // Här kontrolleras att dessa finns i body
        additionalProperties: false,
      },
    },
    required: ["body"], // Här kontrolleras att body finns
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
          },
          password: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["email", "password"],
        additionalProperties: false,
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
          },
          password: {
            type: "string",
            minLength: 8,
          },
        },
        required: ["email", "password"],
        additionalProperties: false,
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
          },
          textdata: {
            type: "string",
            maxLength: 300,
          },
        },
        additionalProperties: false,
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
  