import { Request, Response } from "express";
import admin, { db } from "../../config/firebase.js";

/**
 * Common function to handle user creation or update in Firestore
 */
async function handleUserDocument(userRecord: admin.auth.UserRecord, provider: string) {
  // Check if user document exists in Firestore
  const uid = userRecord.uid;
  const userDocRef = db.collection('users').doc(uid);
  let userProfile = await userDocRef.get();
  
  // Create user document if it doesn't exist
  if (!userProfile.exists) {
    console.log(`Creating new user profile in Firestore for: ${uid} (${provider})`);
    const userData = {
      email: userRecord.email || '',
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || '',
      photoURL: userRecord.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      authProvider: provider,
      role: 'user',
      preferences: {}
    };
    
    await userDocRef.set(userData);
    
    // Get the updated profile
    userProfile = await userDocRef.get();
  } else {
    // Update last login time
    await userDocRef.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  return userProfile;
}

/**
 * Format consistent user response
 */
function formatUserResponse(userRecord: admin.auth.UserRecord, userProfile: FirebaseFirestore.DocumentSnapshot, token: string) {
  return {
    user: {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      profile: userProfile.data()
    },
    token
  };
}

/**
 * Handle errors consistently
 */
function handleError(res: Response, error: unknown, statusCode = 500, defaultMessage = "Server error") {
  console.error(error);
  
  // Extract error message if possible
  let message = defaultMessage;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    message = (error as any).message;
  }
  
  res.status(statusCode).json({ error: message });
}

/**
 * Google Authentication Controller
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    console.log("Google auth handler called");
    const { idToken } = req.body;
    
    if (!idToken) {
      res.status(400).json({ error: "ID Token is required" });
      return;
    }
    
    try {
      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Token verified successfully, user ID:", decodedToken.uid);
      
      // Get user details from Auth
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      
      // Handle user document in Firestore
      const userProfile = await handleUserDocument(userRecord, 'google');
      
      // Return response
      res.status(200).json(formatUserResponse(userRecord, userProfile, idToken));
    } catch (authError) {
      handleError(res, authError, 401, "Invalid Google token");
    }
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * Email/Password Login Controller
 */
export async function emailLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    
    try {
      // Find user record using Admin SDK
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Create a custom token for frontend
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      // Handle user document in Firestore
      const userProfile = await handleUserDocument(userRecord, 'email');
      
      // Return response
      res.status(200).json(formatUserResponse(userRecord, userProfile, customToken));
    } catch (authError) {
      handleError(res, authError, 401, "Invalid email or password");
    }
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * Session Verification Controller
 */
export async function verifySession(req: Request, res: Response): Promise<void> {
  try {
    // User is already authenticated via authMiddleware
    const uid = req.user.uid;
    
    try {
      // Get user details
      const userRecord = await admin.auth().getUser(uid);
      
      // Handle user document in Firestore
      const userProfile = await handleUserDocument(userRecord, 'session');
      
      // Return user data (no new token needed)
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
      handleError(res, verifyError, 401, "Invalid session");
    }
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * User Registration Controller
 */
export async function register(req: Request, res: Response): Promise<void> {
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
      
      // Handle user document in Firestore
      const userProfile = await handleUserDocument(userRecord, 'email');
      
      // Create token
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      // Return response
      res.status(201).json(formatUserResponse(userRecord, userProfile, customToken));
    } catch (authError) {
      handleError(res, authError, 400, "Registration failed");
    }
  } catch (error) {
    handleError(res, error);
  }
}

// Default export for backward compatibility
export default {
  googleAuth,
  emailLogin,
  verifySession,
  register
};