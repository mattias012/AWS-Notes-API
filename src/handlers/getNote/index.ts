// src/handlers/getNote/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { GetCommand, GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import validateToken from '../../utils/auth'; // Import validateToken from auth.ts

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const token = event.headers.Authorization?.split(' ')[1];

    // Validate JWT token
    if (!token) {
      return formatJSONResponse(401, { message: 'Missing or invalid Authorization token.' });
    }

    const userId = validateToken(token);

    const { noteId } = event.pathParameters || {};
    if (!noteId) {
      return formatJSONResponse(400, { message: 'Missing noteId in path parameters.' });
    }

    // Get the specific note from DynamoDB
    const params = {
      TableName: NOTES_TABLE,
      Key: {
        userId,
        noteId,
      },
    };

    const result = await config.dynamoDb.send(new GetCommand(params)) as GetCommandOutput;

    // Check if the note exists
    if (!result.Item) {
      return formatJSONResponse(404, { message: 'Note not found.' });
    }

    // Return the requested note
    return formatJSONResponse(200, { note: result.Item });
  } catch (error) {
    console.error('Error in getNote:', error);
    return formatJSONResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
