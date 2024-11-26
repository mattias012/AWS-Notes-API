import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { updateNoteSchema } from '../../utils/validators'; // Import JSON Schema
import { authMiddleware } from '../../utils/auth'; // Import Middy auth middleware
import { onErrorMiddleware } from '../../utils/onErrorMiddleware'; // Import global error handler

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const updateNote = async (event) => {
  console.log("Event received:", event); // Debugging the incoming event

  // Retrieve userId from event (set by authMiddleware)
  const userId = event.userId;

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
  .use(authMiddleware()) // Validate Authorization header and token
  .use(
    validator({
      eventSchema: transpileSchema(updateNoteSchema), // Transpile JSON Schema for validation
    })
  )
  .use(onErrorMiddleware()) // Global error handler
  .use(httpErrorHandler()); // Handle errors consistently
