import { db } from "@/config/firebase.js";
import { Request, Response } from "express";

export async function GET(req: Request, res?: Response) {
  try {
    const userId = req.params.userId;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
export default GET;