import { Request, Response } from "express";
import { auth } from "@/config/firebase";

export default async function session(req: Request, res: Response) {
  try {
    // Check for session cookie or authorization header
    const sessionCookie = req.cookies.session;
    const authHeader = req.headers.authorization;
    
    // No authentication provided
    if (!sessionCookie && !authHeader) {
      return res.status(401).json({ error: "No active session" });
    }
    
    let decodedToken;
    
    if (sessionCookie) {
      // Verify the session cookie
      decodedToken = await auth.verifySessionCookie(sessionCookie);
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // Verify the ID token if provided as a bearer token
      const idToken = authHeader.split('Bearer ')[1];
      decodedToken = await auth.verifyIdToken(idToken);
    }
    
    if (!decodedToken) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    // Get user details using the UID from the token
    const user = await auth.getUser(decodedToken.uid);
    
    return res.status(200).json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }
    });
  } catch (error: any) {
    return res.status(401).json({ error: error.message || "Authentication failed" });
  }
}