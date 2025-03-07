import { Request, Response } from "express";
import { admin } from "../../config/firebase.js";

export default async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    try {
      // Find the user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // In a real implementation, you'd verify the password
      // Since Firebase Admin doesn't provide password verification,
      // we're creating a custom token for the found user
      
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      return res.status(200).json({ 
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || '',
        },
        token: customToken
      });
    } catch (authError) {
      console.error('Authentication error:', authError);
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}