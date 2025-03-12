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
      
      // Create a custom token for frontend
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      // Get Firestore profile
      const userProfile = await db.collection('users').doc(userRecord.uid).get();
      
      res.status(200).json({
        token: customToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          profile: userProfile.exists ? userProfile.data() : {}
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