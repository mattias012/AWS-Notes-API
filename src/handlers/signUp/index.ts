// This file contains the handler for the POST /signup endpoint.
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { signupSchema } from '../../utils/validators'; // Import signupSchema from validators

const USERS_TABLE = process.env.USERS_TABLE || 'users';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Validate input with Joi
    const { error } = signupSchema.validate(body);
    if (error) {
      return formatJSONResponse(400, { message: error.details[0].message });
    }

    const { email, password } = body;

    // Check if email already exists in DynamoDB
    const getUserParams = {
      TableName: USERS_TABLE,
      Key: {
        email,
      },
    };

    const result = await config.dynamoDb.send(new config.GetCommand(getUserParams));
    if (result.Item) {
      return formatJSONResponse(400, { message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await config.bcrypt.hash(password, 10);

    // Create a new user and save to DynamoDB
    const userId = config.uuidv4();
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId,
        email,
        password: hashedPassword,
      },
    };

    await config.dynamoDb.send(new config.PutCommand(params));

    // Return success response
    return formatJSONResponse(201, { message: 'User created successfully!' });
  } catch (error) {
    console.error('Error in signup:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
