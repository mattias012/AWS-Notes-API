import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb';
import validateToken from '../../utils/auth';
import { getNoteSchema } from '../../utils/validators'; // Import the schema

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const getNote = async (event) => {
  // Validate token and extract userId
  const userId = validateToken(event.headers.Authorization);

  // Extract noteId from path parameters
  const { noteId } = event.pathParameters || {};

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
};

// Export the handler wrapped with Middy
export const handler = middy(getNote)
  .use(jsonBodyParser()) // Automatically parse JSON body (optional for GET)
  .use(validator({ eventSchema: getNoteSchema })) // Validate input with schema
  .use(httpErrorHandler()); // Handle errors consistently
