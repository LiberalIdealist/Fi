import { Request, Response } from "express";
import admin, { db } from "../../config/firebase.js";

export default async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name || email.split('@')[0]
      });
      
      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name: name || email.split('@')[0],
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: 'user',
        preferences: {}
      });
      
      // Create custom token for frontend
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      // Get the full profile data
      const userProfile = await db.collection('users').doc(userRecord.uid).get();
      
      res.status(201).json({ 
        token: customToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          profile: userProfile.data()
        }
      });
    } catch (authError: unknown) {
      console.error('User creation error:', authError);
      let errorMessage = 'User creation failed';
      if (authError instanceof Error) {
        errorMessage = authError.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
}