import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authMiddleware = () => ({
  before: (handler) => {
    //Get authorization header
    const authHeader = handler.event.headers.Authorization || handler.event.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      throw {
        statusCode: 401,
        message: 'Unauthorized: Missing or invalid Authorization header',
      };
    }

    const token = authHeader.split(' ')[1];

    try {
      //verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      if (!decoded.userId) {
        throw new Error('Invalid token payload');
      }

      //add userId to event object
      handler.event.userId = decoded.userId;

      console.log(`Authenticated user: ${decoded.userId}`); //include userId in logs for debugging
    } catch (err) {
      console.error('Invalid token:', err.message);
      throw {
        statusCode: 401,
        message: 'Unauthorized: Invalid token',
      };
    }
  },
});
