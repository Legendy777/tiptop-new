// MONGO BACKUP: import mongoose from 'mongoose';
// MONGO BACKUP: import { logger } from './logger';
// MONGO BACKUP: 
// MONGO BACKUP: // MongoDB connection options
// MONGO BACKUP: const options: mongoose.ConnectOptions = {
// MONGO BACKUP:   // These options are no longer needed in Mongoose 6+
// MONGO BACKUP:   // useNewUrlParser: true,
// MONGO BACKUP:   // useUnifiedTopology: true,
// MONGO BACKUP:   // useCreateIndex: true,
// MONGO BACKUP:   // useFindAndModify: false,
// MONGO BACKUP: };
// MONGO BACKUP: 
// MONGO BACKUP: // Connect to MongoDB
// MONGO BACKUP: export const connectDB = async (): Promise<void> => {
// MONGO BACKUP:   try {
// MONGO BACKUP:     const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/games-store';
// MONGO BACKUP:     
// MONGO BACKUP:     await mongoose.connect(mongoURI, options);
// MONGO BACKUP:     
// MONGO BACKUP:     logger.info('MongoDB connected successfully');
// MONGO BACKUP:     
// MONGO BACKUP:     // Handle connection events
// MONGO BACKUP:     mongoose.connection.on('error', (err) => {
// MONGO BACKUP:       logger.error('MongoDB connection error:', err);
// MONGO BACKUP:     });
// MONGO BACKUP:     
// MONGO BACKUP:     mongoose.connection.on('disconnected', () => {
// MONGO BACKUP:       logger.warn('MongoDB disconnected');
// MONGO BACKUP:     });
// MONGO BACKUP:     
// MONGO BACKUP:     // Handle process termination
// MONGO BACKUP:     process.on('SIGINT', async () => {
// MONGO BACKUP:       await mongoose.connection.close();
// MONGO BACKUP:       logger.info('MongoDB connection closed through app termination');
// MONGO BACKUP:       process.exit(0);
// MONGO BACKUP:     });
// MONGO BACKUP:     
// MONGO BACKUP:   } catch (error) {
// MONGO BACKUP:     logger.error('MongoDB connection error:', error);
// MONGO BACKUP:     process.exit(1);
// MONGO BACKUP:   }
// MONGO BACKUP: };
