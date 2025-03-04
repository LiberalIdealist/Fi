import { Request, Response } from "express";
import { admin, auth } from "@/config/firebase";
import axios from "axios";

export default async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Firebase doesn't expose email/password auth via Admin SDK
    // We need to use the REST API directly
    try {
      // Get Firebase API key from environment
      const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      
      if (!apiKey) {
        console.error("Firebase API key not found in environment variables");
        return res.status(500).json({ error: "Server configuration error" });
      }
      
      // Use Firebase Auth REST API for email/password sign in
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email,
          password,
          returnSecureToken: true
        }
      );
      
      // Extract user info and ID token
      const { idToken, localId: uid, email: userEmail, displayName, photoUrl } = response.data;
      
      // Create a session cookie with the ID token
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      
      // Set the session cookie
      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Return user data and success message
      return res.status(200).json({
        success: true,
        user: {
          uid,
          email: userEmail,
          displayName: displayName || '',
          photoURL: photoUrl || ''
        },
        message: "Login successful"
      });
    } catch (authError: any) {
      // Handle Firebase authentication errors
      console.error('Authentication error:', authError.response?.data || authError);
      
      // Map Firebase error codes to user-friendly messages
      const errorMessage = getAuthErrorMessage(authError);
      return res.status(401).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
}

/**
 * Get user-friendly error message from Firebase auth error
 */
function getAuthErrorMessage(error: any): string {
  // Get the Firebase error code if available
  const errorCode = error.response?.data?.error?.message || 'UNKNOWN_ERROR';
  
  // Map error codes to user-friendly messages
  switch (errorCode) {
    case 'EMAIL_NOT_FOUND':
      return 'No user found with this email address';
    case 'INVALID_PASSWORD':
      return 'Invalid password';
    case 'USER_DISABLED':
      return 'This account has been disabled';
    case 'INVALID_EMAIL':
      return 'Invalid email format';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'Too many failed login attempts. Please try again later';
    default:
      return 'Authentication failed. Please check your credentials';
  }
}