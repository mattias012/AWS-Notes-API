// src/utils/config.ts
import * as dotenv from 'dotenv';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // AWS SDK v3 - DynamoDB klient
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb"; // DynamoDB Document Client och kommandon
import bcrypt from 'bcryptjs'; // Använd standardimport för bcryptjs
import jwt from 'jsonwebtoken'; // Använd standardimport för jsonwebtoken
import { v4 as uuidv4 } from 'uuid'; // För generering av unika användar-ID:n

dotenv.config(); // Laddar miljövariabler från .env

// Konfigurera DynamoDB-klienten
const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoClient);

// Exportera vanliga moduler och DynamoDB
export {
  dynamoDb,
  PutCommand,
  GetCommand,
  bcrypt,
  jwt,
  uuidv4
};
