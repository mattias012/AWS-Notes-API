import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { loginSchema } from '../../utils/validators'; // Import JSON Schema for login validation
import { onErrorMiddleware } from '../../utils/onErrorMiddleware'; // Import global error handler

const USERS_TABLE = process.env.USERS_TABLE || 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Define the main handler function
const login = async (event) => {
  console.log("Event received:", event); // Debugging the incoming event

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
    // Return generic error for invalid credentials
    return formatJSONResponse(401, { message: 'Invalid credentials.' });
  }

  const user = result.Item;

  // Compare passwords
  const validPassword = await config.bcrypt.compare(password, user.password);
  if (!validPassword) {
    // Return generic error for invalid credentials
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
  .use(
    validator({
      eventSchema: transpileSchema(loginSchema), // Transpile JSON Schema for validation
    })
  )
  .use(onErrorMiddleware()) // Global error handler
  .use(httpErrorHandler()); // Handle errors consistently
