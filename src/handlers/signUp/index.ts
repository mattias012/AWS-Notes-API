import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { signupSchema } from '../../utils/validators'; // Import JSON Schema for signup validation
import { ERROR_MESSAGES, createErrorResponse } from '../../utils/errorHandler'; // Import error handling utilities
import { onErrorMiddleware } from '../../utils/onErrorMiddleware'; // Import custom error middleware

const USERS_TABLE = process.env.USERS_TABLE || 'users';

// Define the main handler function
const signUp = async (event) => {
  const { email, password } = event.body;

  // Check if email already exists in DynamoDB
  const getUserParams = {
    TableName: USERS_TABLE,
    Key: {
      email,
    },
  };

  const result = await config.dynamoDb.send(new config.GetCommand(getUserParams));
  if (result.Item) {
    // Return error if the user already exists
    return createErrorResponse(400, ERROR_MESSAGES.USER_EXISTS);
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
};

// Export the handler wrapped with Middy
export const handler = middy(signUp)
  .use(jsonBodyParser()) // Automatically parse JSON body
  .use(validator({ eventSchema: signupSchema })) // Use JSON Schema for validation
  .use(onErrorMiddleware({
    validation: 'Invalid signup data. Please check your input.',
    internal: 'Unable to process signup at this time.',
  })) // Custom error messages for this handler
  .use(httpErrorHandler()); // Handle errors consistently
