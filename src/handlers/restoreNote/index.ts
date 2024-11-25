//restore delete specific note
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config'; // Import config for DynamoDB commands, etc.
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'; // Import UpdateCommand to update item in DynamoDB
import { formatJSONResponse } from '../../utils/responseUtils'; // Helper function to format responses
import validateAuthorizationHeader from '../../utils/auth'; // Import validateAuthorizationHeader for token validation
import { ReturnValue } from "@aws-sdk/client-dynamodb"; // Import ReturnValue for TypeScript typing

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Validate token and extract userId
    const userId = validateAuthorizationHeader(event.headers.Authorization);

    // Check if noteId exists in path parameters
    const { noteId } = event.pathParameters || {};
    if (!noteId) {
      return formatJSONResponse(400, { message: 'Missing noteId in path parameters.' });
    }

    // Set up the parameters to restore the note (set deleted flag to false) in DynamoDB
    const params = {
      TableName: NOTES_TABLE,
      Key: {
        userId,
        noteId,
      },
      UpdateExpression: 'SET deleted = :deleted, modifiedAt = :modifiedAt REMOVE #ttl',
      ExpressionAttributeValues: {
        ':deleted': false,
        ':modifiedAt': new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        '#ttl': 'ttl', // Alias for ttl to avoid keyword conflict
      },
      ReturnValues: ReturnValue.ALL_NEW, // Return all updated attributes after the operation
    };

    // Execute the update command
    const result = await config.dynamoDb.send(new UpdateCommand(params)) as UpdateCommandOutput;

    // Check if the update was successful
    if (!result.Attributes) {
      return formatJSONResponse(404, { message: 'Note not found or not eligible for restore.' });
    }

    // Return success response after restoring
    return formatJSONResponse(200, { message: 'Note restored successfully.', note: result.Attributes });
  } catch (error) {
    console.error('Error in restoreNote:', error);
    return formatJSONResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
