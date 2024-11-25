// src/handlers/restoreNote/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { UpdateCommand, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
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

    // Set up parameters to restore the note by setting `deleted` to false
    const params = {
      TableName: NOTES_TABLE,
      Key: {
        userId,
        noteId,
      },
      UpdateExpression: 'SET deleted = :deleted, modifiedAt = :modifiedAt',
      ExpressionAttributeValues: {
        ':deleted': false,
        ':modifiedAt': new Date().toISOString(),
      },
      ReturnValues: ReturnValue.ALL_NEW, // Return all updated attributes after the operation
    };

    // Execute the update command
    const result = await config.dynamoDb.send(new UpdateCommand(params)) as UpdateCommandOutput;

    // Check if the update was successful
    if (!result.Attributes) {
      return formatJSONResponse(404, { message: 'Note not found or could not be restored.' });
    }

    // Return success response after restoration
    return formatJSONResponse(200, { message: 'Note restored successfully.', note: result.Attributes });
  } catch (error) {
    console.error('Error in restoreNote:', error);
    return formatJSONResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
