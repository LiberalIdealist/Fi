import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.js';

// Helper function for async route handlers
const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = Router();

// Get profile route
router.get('/get-profile/:userId', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(userDoc.data());
}));

// Update profile route
router.post('/update-profile', asyncHandler(async (req: Request, res: Response) => {
  const { email, updates } = req.body;

  if (!email || !updates) {
    res.status(400).json({ error: "Email and update data are required" });
    return;
  }

  const userRef = db.collection("users").doc(email);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await userRef.update(updates);
  res.json({ message: "Profile updated successfully" });
}));

// Delete profile route
router.delete('/delete-profile', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const userRef = db.collection("users").doc(email);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await userRef.delete();
  res.json({ message: "Profile deleted successfully" });
}));

export default router;