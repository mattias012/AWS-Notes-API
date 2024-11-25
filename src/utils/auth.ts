//auth moved out from the handler to a separate file
//this needs to be imported in the handler file where it is used
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Validates a JWT token and returns the user ID if successful.
 * Throws an error if the token is invalid.
 *
 * @param {string} token - The JWT token to be validated
 * @returns {string} - The user ID if the token is valid
 * @throws {Error} - If the token is missing or invalid
 */
const validateToken = (token: string): string => {
  if (!token) {
    throw new Error('Missing or invalid Authorization token.');
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    return (decodedToken as any).userId; // Extract the userId from the token
  } catch (error) {
    throw new Error('Invalid token.');
  }
};

export default validateToken;
