import { Request, Response } from "express";
import admin from "../../config/firebase.js";
import { db, auth } from "../../config/firebase.js"; // Import the configured db

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
      // Verify the token
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log("Token verified successfully, user ID:", decodedToken.uid);
      
      // Get user from Auth
      const userRecord = await auth.getUser(decodedToken.uid);
      
      // Try to get/create user document in Firestore
      try {
        // Use the pre-configured db with correct region and database ID
        const userRef = db.collection('users').doc(decodedToken.uid);
        let userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // Create new user
          await userRef.set({
            email: userRecord.email,
            displayName: userRecord.displayName || '',
            photoURL: userRecord.photoURL || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            authProvider: 'google'
          });
          
          // Get the user doc again
          userDoc = await userRef.get();
        } else {
          // Update last login
          await userRef.update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Return user data with profile from Firestore
        res.status(200).json({
          user: {
            uid: userRecord.uid,
            email: userRecord.email || '',
            displayName: userRecord.displayName || '',
            photoURL: userRecord.photoURL || null,
            profile: userDoc.data() || {}
          },
          token: idToken
        });
        return;
      } catch (firestoreError) {
        // Log the error but continue with Auth-only response
        console.error("Firestore error in Google auth:", firestoreError);
        
        // Fall back to Auth-only response
        res.status(200).json({
          user: {
            uid: userRecord.uid,
            email: userRecord.email || '',
            displayName: userRecord.displayName || '',
            photoURL: userRecord.photoURL || null,
            profile: {
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              provider: 'google'
            }
          },
          token: idToken
        });
        return;
      }
    } catch (authError) {
      console.error("Google auth verification error:", authError);
      res.status(401).json({ error: "Invalid token" });
      return;
    }
  } catch (error) {
    console.error("Server error during Google authentication:", error);
    res.status(500).json({ error: "Authentication failed" });
    return;
  }
}