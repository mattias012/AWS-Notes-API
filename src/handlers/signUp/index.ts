import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'; // Import transpileSchema

import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { signupSchema } from '../../utils/validators'; // Import JSON Schema for signup validation
import { ERROR_MESSAGES, createErrorResponse } from '../../utils/errorHandler';
import { onErrorMiddleware } from '../../utils/onErrorMiddleware';

const USERS_TABLE = process.env.USERS_TABLE || 'users';

const signUp = async (event) => {
  const { email, password } = event.body;

  const getUserParams = {
    TableName: USERS_TABLE,
    Key: {
      email,
    },
  };

  const result = await config.dynamoDb.send(new config.GetCommand(getUserParams));
  if (result.Item) {
    return createErrorResponse(400, ERROR_MESSAGES.USER_EXISTS);
  }

  const hashedPassword = await config.bcrypt.hash(password, 10);

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

  return formatJSONResponse(201, { message: 'User created successfully!' });
};

// Export the handler wrapped with Middy
export const handler = middy(signUp)
  .use(jsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(signupSchema), // Transpile schema for validation
    })
  )
  .use(onErrorMiddleware({
    validation: 'Invalid signup data. Please check your input.',
    internal: 'Unable to process signup at this time.',
  }))
  .use(httpErrorHandler());
