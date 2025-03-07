import { Request, Response } from "express";
import { admin } from "../../config/firebase.js";

export default async function session(req: Request, res: Response) {
  try {
    // Get ID token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    try {
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      // Get user details
      const userRecord = await admin.auth().getUser(uid);
      
      return res.status(200).json({
        authenticated: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          photoURL: userRecord.photoURL || null
        }
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ error: 'Server error checking session' });
  }
}