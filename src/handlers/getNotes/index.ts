import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';

import config from '../../utils/config'; // Import the whole config as an object
import { formatJSONResponse } from '../../utils/responseUtils';
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import validateToken from '../../utils/auth';

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const getNotes = async (event) => {
  // Validate token and extract userId
  const userId = validateToken(event.headers.Authorization);

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
  .use(httpErrorHandler()); // Handle errors consistently
