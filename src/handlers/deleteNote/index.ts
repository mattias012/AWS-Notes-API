import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import config from '../../utils/config'; // Import config for DynamoDB commands, etc.
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'; // Import UpdateCommand to update the item in DynamoDB
import { formatJSONResponse } from '../../utils/responseUtils'; // Helper function to format responses
import { deleteNoteSchema } from '../../utils/validators'; // Import the schema
import { ReturnValue } from '@aws-sdk/client-dynamodb'; // Import ReturnValue for TypeScript typing
import { authMiddleware } from '../../utils/auth'; // Import Middy auth middleware
import { onErrorMiddleware } from '../../utils/onErrorMiddleware'; // Import global error handler

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const deleteNote = async (event) => {
  // Retrieve userId from event (set by authMiddleware)
  const userId = event.userId;

  // Extract noteId from path parameters
  const { noteId } = event.pathParameters || {};

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
  return formatJSONResponse(200, {
    message: 'Note deleted, you can restore it for 30 days if you change your mind',
  });
};

// Export the handler wrapped with Middy
export const handler = middy(deleteNote)
  .use(authMiddleware()) // Validate Authorization header and token
  .use(
    validator({
      eventSchema: transpileSchema(deleteNoteSchema), // Transpile JSON Schema for Ajv compatibility
    })
  )
  .use(onErrorMiddleware()) // Custom global error handler
  .use(httpErrorHandler()); // Handle errors consistently
