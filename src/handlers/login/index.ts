// src/handlers/login/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDb, bcrypt, jwt, GetCommand } from '../../utils/config'; // Importerar dynamoDb, bcrypt, jwt, GetCommand från config
import { formatJSONResponse } from '../../utils/responseUtils'; // Importera responseUtils

const USERS_TABLE = process.env.USERS_TABLE || 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return formatJSONResponse(400, { message: 'Email and password are required.' });
    }

    // Hämta användaren från DynamoDB
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email,
      },
    };

    const result = await dynamoDb.send(new GetCommand(params));

    if (!result.Item) {
      return formatJSONResponse(401, { message: 'Invalid credentials.' });
    }

    const user = result.Item;

    // Kontrollera lösenordet
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return formatJSONResponse(401, { message: 'Invalid credentials.' });
    }

    // Skapa en JWT-token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    return formatJSONResponse(200, { token });
  } catch (error) {
    console.error('Error in login:', error);
    return formatJSONResponse(500, { message: 'Internal Server Error' });
  }
};
