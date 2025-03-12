import express from 'express';
import login from '../controllers/auth/login.js';
import signup from '../controllers/auth/signup.js';
import googleAuth from '../controllers/auth/googleAuth.js';
import session from '../controllers/auth/session.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/session', authMiddleware, session);

export default router;