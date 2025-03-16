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
      const userDocRef = db.collection('users').doc(uid);
      let userProfile = await userDocRef.get();

      // Create user document if it doesn't exist
      if (!userProfile.exists) {
        console.log(`Creating user document for UID: ${uid}`);
        
        const userData = {
          email: userRecord.email || '',
          displayName: userRecord.displayName || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          authProvider: 'session',
          role: 'user',
          preferences: {}
        };
        
        await userDocRef.set(userData);
        userProfile = await userDocRef.get();
      } else {
        // Update last login time
        await userDocRef.update({
          lastLogin: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Return user data with profile
      res.status(200).json({
        authenticated: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          photoURL: userRecord.photoURL || null,
          profile: userProfile.data()
        }
      });
    } catch (verifyError) {
      console.error('User fetch error:', verifyError);
      res.status(401).json({ error: 'Invalid user session' });
    }
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Server error checking session' });
  }
}