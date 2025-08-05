import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error on [${req.method}] ${req.originalUrl} - ${err.message}`, {
    stack: err.stack
  });
  res.status(500).json({ error: 'Internal Server Error' });
};