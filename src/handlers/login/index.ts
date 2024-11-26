import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { loginSchema } from '../../utils/validators'; // Import JSON Schema for login validation

const USERS_TABLE = process.env.USERS_TABLE || 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Define the main handler function
const login = async (event) => {
  const { email, password } = event.body;

  // Get user from DynamoDB
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email,
    },
  };

  const result = await config.dynamoDb.send(new config.GetCommand(params));
  if (!result.Item) {
    return formatJSONResponse(401, { message: 'Invalid credentials.' });
  }

  const user = result.Item;

  // Compare passwords
  const validPassword = await config.bcrypt.compare(password, user.password);
  if (!validPassword) {
    return formatJSONResponse(401, { message: 'Invalid credentials.' });
  }

  // Generate JWT token
  const token = config.jwt.sign(
    {
      userId: user.userId,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

  // Return token
  return formatJSONResponse(200, { token });
};

// Export the handler wrapped with Middy
export const handler = middy(login)
  .use(jsonBodyParser()) // Automatically parse JSON body
  .use(validator({ eventSchema: loginSchema })) // Use JSON Schema for validation
  .use(httpErrorHandler()); // Handle errors consistently
