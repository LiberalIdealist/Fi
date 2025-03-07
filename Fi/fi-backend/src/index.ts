import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Add .js extensions for ESM compatibility
import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentsRoutes from './routes/documentsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import recommendationsRoutes from './routes/recommendationsRoutes.js';
import { authMiddleware } from './config/authMiddleware.js';
import routes from './routes/routes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all requests
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes definition endpoint for frontend consumption
app.get('/routes', (req: Request, res: Response) => {
  res.json(routes);
});

// Mount routes based on your original architecture
app.use('/auth', authRoutes);
app.use('/market', marketRoutes);
app.use('/chat', authMiddleware, chatRoutes);
app.use('/documents', authMiddleware, documentsRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/recommendations', authMiddleware, recommendationsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`
  });
});

// Global error handler with proper type annotations
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Routes documentation available at http://localhost:${PORT}/routes`);
});

export default app;