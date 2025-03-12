import { Request, Response, NextFunction } from 'express';
import auth from './firebase.js';
import admin from './firebase.js'; // Import admin as default
import routes, { requiresAuth } from '../routes/routes.js';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user: {
        uid: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Authentication middleware for Express
 * Validates Firebase authentication token and attaches user info to request
 */
// This middleware will work with Google tokens without modification
// Interface for the decoded token from Firebase
interface DecodedToken {
  uid: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (!token) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }
    
    // Works with Google OAuth tokens automatically
    const decodedToken: DecodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0]
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token exists, but doesn't block unauthenticated requests
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
    const sessionCookie = req.cookies?.session;

    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    } else if (sessionCookie) {
      const decodedToken = await admin.auth().verifySessionCookie(sessionCookie);
      req.user = decodedToken;
    }
  } catch (error) {
    // Just log the error but don't block the request
    console.warn('Optional auth failed:', error);
  }
  
  // Continue regardless of authentication result
  return next();
};

/**
 * Role-based authentication middleware factory
 * @param requiredRoles Array of roles allowed to access the route
 */
export const roleMiddleware = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has required role (stored in custom claims)
    const userRoles = req.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    return next();
  };
};

/**
 * Dynamic authentication middleware
 * Uses authMiddleware or optionalAuthMiddleware based on route requirements
 */
export const routeAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const needsAuth = requiresAuth(req.path);
  return needsAuth ? authMiddleware(req, res, next) : optionalAuthMiddleware(req, res, next);
};