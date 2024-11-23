// src/handlers/signup/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDb, bcrypt, uuidv4, PutCommand } from '../../utils/config'; // Importerar dynamoDb, bcrypt, uuid, PutCommand från config
import { formatJSONResponse } from '../../utils/responseUtils'; // Importera responseUtils

const USERS_TABLE = process.env.USERS_TABLE || 'users';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return formatJSONResponse(400, { message: 'Email and password are required.' });
    }

    // Hasha lösenordet med bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Spara användare till DynamoDB
    const userId = uuidv4();
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId,
        email,
        password: hashedPassword,
      },
    };

    await dynamoDb.send(new PutCommand(params));

    return formatJSONResponse(201, { message: 'User created successfully!' });
  } catch (error) {
    console.error('Error in signup:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
