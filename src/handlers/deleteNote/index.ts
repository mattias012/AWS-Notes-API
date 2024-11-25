// deleteNote with soft delete and TTL for automatic hard delete
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config'; // Import config for DynamoDB commands, etc.
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'; // Import UpdateCommand to update the item in DynamoDB
import { formatJSONResponse } from '../../utils/responseUtils'; // Helper function to format responses
import validateToken from '../../utils/auth'; // Import validateToken for token validation
import { ReturnValue } from "@aws-sdk/client-dynamodb"; // Import ReturnValue for TypeScript typing

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

    // Set TTL value to 30 days from now (in seconds)
    const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    // Set up the parameters to mark the note as deleted (soft delete) in DynamoDB and set TTL for automatic hard delete
    const params = {
      TableName: NOTES_TABLE,
      Key: {
        userId,
        noteId,
      },
      UpdateExpression: 'SET deleted = :deleted, modifiedAt = :modifiedAt, #ttl = :ttl',
      ExpressionAttributeValues: {
        ':deleted': true,
        ':modifiedAt': new Date().toISOString(),
        ':ttl': ttl, // Set the ttl attribute to automatically delete the item after 30 days (also set TTL on the table in serverless.yml)
      },
      ExpressionAttributeNames: {
        '#ttl': 'ttl', // Use an alias for the reserved attribute name
      },
      ReturnValues: ReturnValue.ALL_NEW, // Return all updated attributes after the operation
    };

    // Execute the update command
    const result = await config.dynamoDb.send(new UpdateCommand(params)) as UpdateCommandOutput;

    // Check if the update was successful
    if (!result.Attributes) {
      return formatJSONResponse(404, { message: 'Note not found.' });
    }

    // Return success response after soft deletion
    return formatJSONResponse(200, { message: 'Note deleted, you can restore it for 30 days if you change your mind' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    return formatJSONResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
