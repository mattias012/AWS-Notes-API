// src/handlers/createNote/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config'; // Import the whole config as an object
import { formatJSONResponse } from '../../utils/responseUtils';

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Define Joi schema for note validation
const noteSchema = config.Joi.object({
  title: config.Joi.string().max(50).required().messages({
    "string.max": "Title must not exceed 50 characters.",
    "any.required": "Title is required.",
  }),
  text: config.Joi.string().max(300).required().messages({
    "string.max": "Text must not exceed 300 characters.",
    "any.required": "Text is required.",
  }),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const token = event.headers.Authorization?.split(' ')[1];

    // Validate JWT token
    if (!token) {
      return formatJSONResponse(401, { message: 'Missing or invalid Authorization token.' });
    }

    let userId;
    try {
      // Use jwt from config to verify the token
      const decodedToken = config.jwt.verify(token, JWT_SECRET);
      userId = (decodedToken as any).userId;
    } catch (error) {
      return formatJSONResponse(401, { message: 'Invalid token.' });
    }

    const body = JSON.parse(event.body || '{}');

    // Validate input with Joi
    const { error } = noteSchema.validate(body);
    if (error) {
      return formatJSONResponse(400, { message: error.details[0].message });
    }

    const { title, text } = body;

    // Generate a unique note ID
    const noteId = config.uuidv4();
    const createdAt = new Date().toISOString();
    const modifiedAt = createdAt;

    // Create new note item for DynamoDB
    const params = {
      TableName: NOTES_TABLE,
      Item: {
        userId,
        noteId,
        title,
        text,
        createdAt,
        modifiedAt,
      },
    };

    // Put new note into DynamoDB
    await config.dynamoDb.send(new config.PutCommand(params));

    // Return success response
    return formatJSONResponse(201, { message: 'Note created successfully!', noteId });
  } catch (error) {
    console.error('Error in createNote:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
