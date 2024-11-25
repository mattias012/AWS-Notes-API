// src/handlers/updateNote/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { UpdateCommand, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb"; // Import ReturnValue for TypeScript typing

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Define Joi schema for note update validation
const updateNoteSchema = config.Joi.object({
  title: config.Joi.string().max(50).optional().messages({
    "string.max": "Title must not exceed 50 characters.",
  }),
  text: config.Joi.string().max(300).optional().messages({
    "string.max": "Text must not exceed 300 characters.",
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
      const decodedToken = config.jwt.verify(token, JWT_SECRET);
      userId = (decodedToken as any).userId;
    } catch (error) {
      return formatJSONResponse(401, { message: 'Invalid token.' });
    }

    const { noteId } = event.pathParameters || {};
    if (!noteId) {
      return formatJSONResponse(400, { message: 'Missing noteId in path parameters.' });
    }

    const body = JSON.parse(event.body || '{}');

    // Validate input with Joi
    const { error } = updateNoteSchema.validate(body);
    if (error) {
      return formatJSONResponse(400, { message: error.details[0].message });
    }

    const { title, text } = body;
    const modifiedAt = new Date().toISOString();

    // Update the note in DynamoDB
    const params = {
      TableName: NOTES_TABLE,
      Key: {
        userId,
        noteId,
      },
      UpdateExpression: 'SET title = :title, text = :text, modifiedAt = :modifiedAt',
      ExpressionAttributeValues: {
        ':title': title,
        ':text': text,
        ':modifiedAt': modifiedAt,
      },
      ReturnValues: ReturnValue.ALL_NEW, // Use ReturnValue enum to set the correct type otherwise it defaults to 'NONE' and throws an error in vs code
    };

    const result = await config.dynamoDb.send(new UpdateCommand(params)) as UpdateCommandOutput;

    // Check if the update was successful
    if (!result.Attributes) {
      return formatJSONResponse(404, { message: 'Note not found.' });
    }

    // Return updated note
    return formatJSONResponse(200, { note: result.Attributes });
  } catch (error) {
    console.error('Error in updateNote:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
