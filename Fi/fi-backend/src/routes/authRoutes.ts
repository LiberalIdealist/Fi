import { Router } from 'express';
import { googleAuth, emailLogin, verifySession, register } from '../controllers/auth/index.js';
import { authMiddleware } from '../config/authMiddleware.js';
import session from '@/controllers/auth/session.js';

const router = Router();

// Authentication routes
router.post('/google', googleAuth);
router.post('/login', emailLogin);
router.post('/register', register);
router.get('/session', authMiddleware, session);

export default router;