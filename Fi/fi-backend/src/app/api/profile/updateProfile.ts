import { NextResponse } from "next/server";
import { db } from "@/config/firebase"; // Ensure Firestore is properly set up

export async function POST(req: Request) {
  try {
    const { email, updates } = await req.json();

    if (!email || !updates) {
      return NextResponse.json({ error: "Email and update data are required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.update(updates);

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}