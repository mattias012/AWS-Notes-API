import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';

import config from '../../utils/config'; // Import config for DynamoDB commands, etc.
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'; // Import UpdateCommand to update item in DynamoDB
import { formatJSONResponse } from '../../utils/responseUtils'; // Helper function to format responses
import { authMiddleware } from '../../utils/auth'; // Import Middy auth middleware
import { onErrorMiddleware } from '../../utils/onErrorMiddleware'; // Import global error handler
import { restoreNoteSchema } from '../../utils/validators'; // Import JSON Schema for validation
import { ReturnValue } from '@aws-sdk/client-dynamodb'; // Import ReturnValue for TypeScript typing

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const restoreNote = async (event) => {
  // Retrieve userId from event (set by authMiddleware)
  const userId = event.userId;

  // Extract noteId from path parameters
  const { noteId } = event.pathParameters || {};

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
};

// Export the handler wrapped with Middy
export const handler = middy(restoreNote)
  .use(authMiddleware()) // Validate Authorization header and token
  .use(validator({ eventSchema: restoreNoteSchema })) // Validate input with JSON Schema
  .use(onErrorMiddleware()) // Global error handler
  .use(httpErrorHandler()); // Handle errors consistently
