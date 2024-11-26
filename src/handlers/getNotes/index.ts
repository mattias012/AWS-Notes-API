import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';

import config from '../../utils/config'; // Import the whole config as an object
import { formatJSONResponse } from '../../utils/responseUtils';
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import { authMiddleware } from '../../utils/auth'; // Import Middy auth middleware
import { onErrorMiddleware } from '../../utils/onErrorMiddleware'; // Import global error handler

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const getNotes = async (event) => {
  console.log("Event received:", event); // Debugging the incoming event

  // Retrieve userId from event (set by authMiddleware)
  const userId = event.userId;

  // Query DynamoDB to get all notes for the user
  const params = {
    TableName: NOTES_TABLE,
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: 'deleted = :deleted',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':deleted': false, // Only get notes that are not marked as deleted
    },
  };

  const result = await config.dynamoDb.send(new QueryCommand(params)) as QueryCommandOutput;

  // Type check to see if Items exists in the result
  if (!result.Items || result.Items.length === 0) {
    return formatJSONResponse(404, { message: 'No notes found.' });
  }

  // Return the user's notes
  return formatJSONResponse(200, { notes: result.Items });
};

// Export the handler wrapped with Middy
export const handler = middy(getNotes)
  .use(authMiddleware()) // Validate Authorization header and token
  .use(onErrorMiddleware()) // Handle global errors
  .use(httpErrorHandler()); // Handle errors consistently
