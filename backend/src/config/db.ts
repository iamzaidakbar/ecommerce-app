import mongoose from 'mongoose';
import env from './env';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/db-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/db.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err: any) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  logger.info('Application termination signal received');
  await disconnectDB();
  process.exit(0);
});

export default connectDB;
