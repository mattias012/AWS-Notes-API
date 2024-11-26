import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { updateNoteSchema } from '../../utils/validators'; // Import JSON Schema
import validateToken from '../../utils/auth';

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const updateNote = async (event) => {
  // Validate Authorization header and get userId
  const userId = validateToken(event.headers.Authorization);

  // Extract noteId from path parameters
  const { noteId } = event.pathParameters || {};

  const { title, textdata } = event.body;
  const modifiedAt = new Date().toISOString();

  // Update the note in DynamoDB
  const params = {
    TableName: NOTES_TABLE,
    Key: {
      userId,
      noteId,
    },
    UpdateExpression: 'SET title = :title, textdata = :textdata, modifiedAt = :modifiedAt',
    ExpressionAttributeValues: {
      ':title': title,
      ':textdata': textdata,
      ':modifiedAt': modifiedAt,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  const result = await config.dynamoDb.send(new UpdateCommand(params)) as UpdateCommandOutput;

  if (!result.Attributes) {
    return formatJSONResponse(404, { message: 'Note not found.' });
  }

  return formatJSONResponse(200, { note: result.Attributes });
};

// Export the handler wrapped with Middy
export const handler = middy(updateNote)
  .use(jsonBodyParser()) // Automatically parse JSON body
  .use(validator({ eventSchema: updateNoteSchema })) // Use JSON Schema for validation
  .use(httpErrorHandler()); // Handle errors consistently
