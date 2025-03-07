import { Request, Response } from "express";
import { admin } from "../../config/firebase.js";

export default async function signup(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Create user with Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    return res.status(201).json({ 
      message: "User created successfully", 
      user: {
        uid: userRecord.uid,
        email: userRecord.email
      }
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ error: "Failed to sign up user" });
  }
}