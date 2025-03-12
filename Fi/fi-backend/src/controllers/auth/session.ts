import { Request, Response } from "express";
import admin, { db } from "../../config/firebase.js";

export default async function session(req: Request, res: Response): Promise<void> {
  try {
    // User is already authenticated via authMiddleware
    const uid = req.user.uid;
    
    try {
      // Get user details
      const userRecord = await admin.auth().getUser(uid);
      
      // Get user profile from Firestore
      const userProfile = await db.collection('users').doc(uid).get();
      
      res.status(200).json({
        authenticated: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          photoURL: userRecord.photoURL || null,
          profile: userProfile.exists ? userProfile.data() : {}
        }
      });
      // No return statement - implicit void
    } catch (verifyError) {
      console.error('User fetch error:', verifyError);
      res.status(401).json({ error: 'Invalid user session' });
      // No return statement - implicit void
    }
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Server error checking session' });
    // No return statement - implicit void
  }
}