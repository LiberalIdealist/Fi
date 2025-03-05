import { Request, Response, NextFunction } from 'express';
import { auth, admin } from '../config/firebase'; // Import both auth and admin

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

/**
 * Authentication middleware for Express
 * Validates Firebase authentication token and attaches user info to request
 */
export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: "Invalid authentication token" });
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