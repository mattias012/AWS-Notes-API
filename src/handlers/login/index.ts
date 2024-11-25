// src/handlers/login.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config';
import { formatJSONResponse } from '../../utils/responseUtils';
import { loginSchema } from '../../utils/validators'; // Import loginSchema from validators

const USERS_TABLE = process.env.USERS_TABLE || 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Validate input with Joi
    const { error } = loginSchema.validate(body);
    if (error) {
      return formatJSONResponse(400, { message: error.details[0].message });
    }

    const { email, password } = body;

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
  } catch (error) {
    console.error('Error in login:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
