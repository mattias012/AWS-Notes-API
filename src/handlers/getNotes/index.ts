//to get ALL notes from an user
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config'; // Import the whole config as an object
import { formatJSONResponse } from '../../utils/responseUtils';
import { QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";

const NOTES_TABLE = process.env.NOTES_TABLE || 'notes';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const token = event.headers.Authorization?.split(' ')[1];

    // Validate JWT token
    if (!token) {
      return formatJSONResponse(401, { message: 'Missing or invalid Authorization token.' });
    }

    let userId;
    try {
      const decodedToken = config.jwt.verify(token, JWT_SECRET);
      userId = (decodedToken as any).userId;
    } catch (error) {
      return formatJSONResponse(401, { message: 'Invalid token.' });
    }

    // Query DynamoDB to get all notes for the user
    const params = {
      TableName: NOTES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await config.dynamoDb.send(new QueryCommand(params)) as QueryCommandOutput;

    // Type check to see if Items exists in the result
    if (!result.Items) {
      return formatJSONResponse(404, { message: 'No notes found.' });
    }

    // Return the user's notes
    return formatJSONResponse(200, { notes: result.Items });
  } catch (error) {
    console.error('Error in getNotes:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
