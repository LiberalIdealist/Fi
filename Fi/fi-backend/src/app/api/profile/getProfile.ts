import { db } from "@/config/firebase";
import { NextResponse } from "next/server";
import { Request, Response } from "express";

export async function GET(req: Request, res?: Response) {
  try {
    const userId = req.params.userId;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export default GET;