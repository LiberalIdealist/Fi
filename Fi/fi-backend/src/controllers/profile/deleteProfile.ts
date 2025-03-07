import { Response } from "express";
import { db } from "@/config/firebase.js"; // Ensure Firestore is properly set up

export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.delete();

    return Response.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return Response.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}