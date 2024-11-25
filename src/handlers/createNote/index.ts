// createNote handler to create a new note
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config'; // Import the whole config as an object
import { formatJSONResponse } from '../../utils/responseUtils';
import { noteSchema } from '../../utils/validators';
import validateToken from '../../utils/auth'; // Import validateToken function

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Validate Authorization header and get userId
    const userId = validateToken(event.headers.Authorization);

    // Parse the request body
    const body = JSON.parse(event.body || '{}');

    // Validate input with Joi schema
    const { error } = noteSchema.validate(body);
    if (error) {
      return formatJSONResponse(400, { message: error.details[0].message });
    }

    const { title, textdata } = body;

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
  } catch (error) {
    console.error('Error in createNote:', error);
    return formatJSONResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
