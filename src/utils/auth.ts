import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authMiddleware = () => ({
  before: (handler) => {
    const authHeader = handler.event.headers.Authorization || handler.event.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      handler.event.userId = decoded.userId; // Add userId to the event object
    } catch (err) {
      console.error('Invalid token:', err.message);
      throw new Error('Invalid token');
    }
  },
});
