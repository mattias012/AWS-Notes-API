// src/handlers/deleteNote/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { formatJSONResponse } from '../../utils/responseUtils';

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

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

    // Delete the note from DynamoDB
    const params = {
      TableName: NOTES_TABLE,
      Key: {
        userId,
        noteId,
      },
    };
    await config.dynamoDb.send(new DeleteCommand(params));

    // Return success response
    return formatJSONResponse(200, { message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
