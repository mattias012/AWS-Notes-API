//auth moved out from the handler to a separate file
//this needs to be imported in the handler file where it is used
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Middy middleware for validating JWT tokens.
 * Adds `userId` to the `request.event` if the token is valid.
 */
export const authMiddleware = () => ({
  before: (request: any) => {
    const authHeader = request.event.headers.Authorization;

    if (!authHeader) {
      throw new Error('Missing Authorization header.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error('Missing or invalid Authorization token.');
    }

    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      request.event.userId = (decodedToken as any).userId; // add userId to the event
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
});
