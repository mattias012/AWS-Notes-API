//getNote function
//gets a specific note from the DynamoDB table
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { GetCommand, GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import validateToken from '../../utils/auth';

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Validate token and extract userId
    const userId = validateToken(event.headers.Authorization);

    // Check if noteId exists in path parameters
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

    // Check if the note exists and if it is not marked as deleted
    if (!result.Item || result.Item.deleted) {
      return formatJSONResponse(404, { message: 'Note not found or has been deleted.' });
    }

    // Return the requested note
    return formatJSONResponse(200, { note: result.Item });
  } catch (error) {
    console.error('Error in getNote:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
