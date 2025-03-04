import { NextResponse } from "next/server";
import { db } from "@/config/firebase"; // Ensure Firestore is properly set up

export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.delete();

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}