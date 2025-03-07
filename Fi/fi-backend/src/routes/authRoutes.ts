// Add .js extensions for ESM compatibility
import { Router, Request, Response } from 'express';

// Create wrapper function
const asyncHandler = (fn: (req: Request, res: Response, next: Function) => Promise<any>) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

import login from '../controllers/auth/login.js';
import signup from '../controllers/auth/signup.js';
import session from '../controllers/auth/session.js';

const router = Router();

// Wrap your handlers
router.post('/login', asyncHandler(login));
router.post('/signup', asyncHandler(signup));
router.get('/session', asyncHandler(session));

export default router;