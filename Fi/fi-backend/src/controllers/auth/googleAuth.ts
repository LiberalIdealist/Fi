import { Request, Response } from "express";
import admin, { db } from "../../config/firebase.js";

// Add this type guard function
function isFirebaseAuthError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' && 
    error !== null && 
    'code' in error && 
    typeof (error as any).code === 'string'
  );
}

export default async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    console.log("Google auth handler called");
    const { idToken } = req.body;
    
    if (!idToken) {
      console.error("No ID token provided");
      res.status(400).json({ error: "ID Token is required" });
      return;
    }
    
    try {
      // Verify the Google ID token - THIS WORKS FINE
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Token verified successfully, user ID:", decodedToken.uid);
      
      const uid = decodedToken.uid;
      
      // Get user details from Firebase Auth - THIS WORKS FINE
      const userRecord = await admin.auth().getUser(uid);
      console.log("User record retrieved:", userRecord.uid);
      
      // SKIP FIRESTORE OPERATIONS FOR NOW - RETURN SUCCESS WITH AUTH DATA ONLY
      res.status(200).json({
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || '',
          photoURL: userRecord.photoURL || null,
          // Don't include Firestore profile
        },
        token: idToken // Return the same ID token - client already has it
      });

      // LATER: Once you've created a Firestore database, uncomment this code
      /*
      try {
        // Check if user document exists in Firestore
        let userProfile = await db.collection('users').doc(uid).get();
        
        // Create user document if it doesn't exist
        if (!userProfile.exists) {
          console.log("Creating new user profile in Firestore");
          const userData = {
            email: userRecord.email,
            displayName: userRecord.displayName || userRecord.email?.split('@')[0],
            photoURL: userRecord.photoURL,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            authProvider: 'google',
            role: 'user',
            preferences: {}
          };
          
          await db.collection('users').doc(uid).set(userData);
        }
      } catch (firestoreError) {
        // Log Firestore error but don't fail the authentication
        console.error("Firestore operation failed:", firestoreError);
        // Authentication was still successful, so we continue
      }
      */
      
    } catch (authError) {
      console.error('Google authentication error details:', authError);
      res.status(401).json({ error: 'Invalid Google token' });
    }
  } catch (error) {
    console.error('Google auth server error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
}