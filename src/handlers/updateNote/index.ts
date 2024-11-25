//update a specific note
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { UpdateCommand, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { updateNoteSchema } from '../../utils/validators';
import validateToken from '../../utils/auth';

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Validate Authorization header and get userId
    const userId = validateToken(event.headers.Authorization);

    // Check if noteId exists in path parameters
    const { noteId } = event.pathParameters || {};
    if (!noteId) {
      return formatJSONResponse(400, { message: 'Missing noteId in path parameters.' });
    }

    const body = JSON.parse(event.body || '{}');

    // Validate input with Joi
    const { error } = updateNoteSchema.validate(body);
    if (error) {
      return formatJSONResponse(400, { message: error.details[0].message });
    }

    const { title, textdata } = body;
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
  } catch (error) {
    console.error('Error in updateNote:', error);
    return formatJSONResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
