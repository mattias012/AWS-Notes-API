import { APIGatewayProxyHandler } from 'aws-lambda';
import { formatJSONResponse } from '../utils/responseUtils';

import * as dotenv from 'dotenv';
dotenv.config();

const tableName = process.env.NOTES_TABLE;


export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    //my logic goes here in the future
    const responseMessage = { message: 'Hello test!' };

    return formatJSONResponse(200, responseMessage);
  } catch (error) {
    const typedError = error as Error;
    return formatJSONResponse(500, { message: 'Internal Server Error', error: typedError.message });
  }  
};
