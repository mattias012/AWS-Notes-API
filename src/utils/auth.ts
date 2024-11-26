//auth moved out from the handler to a separate file
//this needs to be imported in the handler file where it is used
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Validates the Authorization header and JWT token.
 * @param {string | undefined} authHeader - The Authorization header to be validated.
 * @returns {string} - The user ID if the token is valid.
 * @throws {Error} - If the Authorization header or token is invalid.
 */
const validateToken = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw new Error('Missing Authorization header.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Missing or invalid Authorization token.');
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    return (decodedToken as any).userId; // Extract the userId from the token
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default validateToken;
