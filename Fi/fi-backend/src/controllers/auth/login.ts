import { Request, Response } from "express";
import admin, { db } from "../../config/firebase.js";

export default async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    
    try {
      // Find user record using Admin SDK
      const userRecord = await admin.auth().getUserByEmail(email);
      const uid = userRecord.uid;
      
      // Create a custom token for frontend
      const customToken = await admin.auth().createCustomToken(uid);
      
      // Get user profile from Firestore
      const userDocRef = db.collection('users').doc(uid);
      let userProfile = await userDocRef.get();
      
      // Create user document if it doesn't exist
      if (!userProfile.exists) {
        console.log(`Creating user document for UID: ${uid}`);
        const userData = {
          email: userRecord.email || '',
          displayName: userRecord.displayName || email.split('@')[0],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          authProvider: 'email',
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
      
      res.status(200).json({
        token: customToken,
        user: {
          uid: uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          profile: userProfile.data()
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}