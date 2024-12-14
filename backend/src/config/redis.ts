import { createClient } from 'redis';
import env from './env';
import { NextFunction, Request, Response } from 'express';

// Extend Express Response type
interface CustomResponse extends Response {
  sendResponse: Response['send'];
}

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const key = `__express__${req.originalUrl}`;
    const cachedResponse = await redisClient.get(key);

    if (cachedResponse) {
      return res.send(JSON.parse(cachedResponse));
    }

    (res as CustomResponse).sendResponse = res.send;
    res.send = (body: any): Response => {
      redisClient.setEx(key, 3600, JSON.stringify(body));
      return (res as CustomResponse).sendResponse(body);
    };
    next();
  } catch (error) {
    next(error);
  }
};

export default redisClient; 