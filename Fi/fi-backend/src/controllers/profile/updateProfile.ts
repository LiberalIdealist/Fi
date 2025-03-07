import { Response } from "express";
import { db } from "@/config/firebase.js"; // Ensure Firestore is properly set up

export async function POST(req: Request) {
  try {
    const { email, updates } = await req.json();

    if (!email || !updates) {
      return Response.json({ error: "Email and update data are required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.update(updates);

    return Response.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}