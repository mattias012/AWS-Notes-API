// src/handlers/signup.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import config from '../../utils/config'; // Import the whole config as an object
import { formatJSONResponse } from '../../utils/responseUtils';

const USERS_TABLE = process.env.USERS_TABLE || 'users';

// Define Joi schema for validation
const signupSchema = config.Joi.object({
  email: config.Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: config.Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long.",
    "any.required": "Password is required.",
  }),
});

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
