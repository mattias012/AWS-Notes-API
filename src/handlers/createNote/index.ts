import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import { formatJSONResponse } from '../../utils/responseUtils';
import { createNoteSchema } from '../../utils/validators'; // Import JSON Schema
import config from '../../utils/config';
import { authMiddleware } from '../../utils/auth'; // Import authMiddleware

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

// Define the main handler function
const createNote = async (event) => {
  // Retrieve userId from event (added by authMiddleware)
  const userId = event.userId;

  // Extract validated body
  const { title, textdata } = event.body;

  // Generate a unique note ID and timestamps
  const noteId = config.uuidv4();
  const createdAt = new Date().toISOString();
  const modifiedAt = createdAt;

  // Prepare new note item for DynamoDB
  const params = {
    TableName: NOTES_TABLE,
    Item: {
      userId,
      noteId,
      title,
      textdata,
      createdAt,
      modifiedAt,
      deleted: false, // Set the deleted flag to false as the default for new notes
    },
  };

  // Put new note into DynamoDB
  await config.dynamoDb.send(new config.PutCommand(params));

  // Return success response
  return formatJSONResponse(201, { message: 'Note created successfully!', noteId });
};

// Export the handler wrapped with Middy
export const handler = middy(createNote)
  .use(jsonBodyParser()) // Automatically parse JSON body
  .use(authMiddleware()) // Validate Authorization header and token
  .use(
    validator({
      eventSchema: transpileSchema(createNoteSchema), // Transpile JSON Schema
    })
  )
  .use(httpErrorHandler()); // Handle errors consistently
