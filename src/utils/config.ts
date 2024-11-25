// src/utils/config.ts
import * as dotenv from 'dotenv';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // AWS SDK v3 - DynamoDB
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb"; // DynamoDB Document Client and commands
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

// Load environment variables from .env file
dotenv.config();

// Configure DynamoDB
const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoClient);

// Export all utilities as a default export
export default {
  dynamoDb,
  PutCommand,
  GetCommand,
  bcrypt,
  jwt,
  Joi,
  uuidv4,
};
