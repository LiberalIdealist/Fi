import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import bodyParser from 'body-parser';

// Add .js extensions for ESM compatibility
import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentsRoutes from './routes/documentsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import recommendationsRoutes from './routes/recommendationsRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import { authMiddleware } from './config/authMiddleware.js';
import routes from './routes/routes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set trust proxy for rate limiter
app.set('trust proxy', 1);

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
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ubiquitous-waddle-7v5j49wq95wjhwrrp-3000.app.github.dev'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Fi backend API is running' });
});

// Type definitions for Express router introspection
interface RouteInfo {
  path: string;
  methods: string[];
}

// API routes map (helpful for debugging)
app.get('/routes', (req, res) => {
  const routes: RouteInfo[] = [];
  
  // Extract all registered routes
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = handler.route.path;
          const baseRoute = middleware.regexp.toString()
            .split('\\')[1]  // Extract base path
            .replace(/\\/g, '')
            .replace(/\?/g, '');
            
          routes.push({
            path: '/' + baseRoute + path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({ routes });
});

// Mount routes based on your original architecture
app.use('/auth', authRoutes);
app.use('/market', marketRoutes);
app.use('/chat', authMiddleware, chatRoutes);
app.use('/documents', authMiddleware, documentsRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/recommendations', authMiddleware, recommendationsRoutes);
app.use('/gemini', geminiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`
  });
});

// Extend Error type to include status property
interface CustomError extends Error {
  status?: number;
}

// Global error handler with proper type annotations
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Routes documentation available at http://localhost:${PORT}/routes`);
});

export default app;