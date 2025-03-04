import { Request, Response, NextFunction } from 'express';
import { admin } from '@/config/firebase';

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
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

  // Check for session cookie as fallback
  const sessionCookie = req.cookies?.session;
  
  if (!token && !sessionCookie) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    let decodedToken;
    
    if (token) {
      // Verify token
      decodedToken = await admin.auth().verifyIdToken(token);
    } else if (sessionCookie) {
      // Verify session cookie
      decodedToken = await admin.auth().verifySessionCookie(sessionCookie);
    }
    
    if (!decodedToken) {
      return res.status(403).json({ error: 'Invalid authentication' });
    }
    
    // Check if token is expired
    const now = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp < now) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Attach the user information to the request
    req.user = decodedToken;
    
    // Continue to the next middleware or route handler
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid authentication token' });
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