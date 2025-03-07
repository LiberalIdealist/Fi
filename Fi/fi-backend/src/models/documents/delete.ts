import { Request, Response } from "express";
import { storage as firebaseStorage } from "../../config/firebase.js";

/**
 * Delete document controller for Express
 */
export async function deleteDocument(req: Request, res: Response) {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Extract file name from URL
    const bucketName = process.env.GCS_BUCKET_NAME as string;
    const fileName = fileUrl.split(`/${bucketName}/`)[1];
    
    // Delete the file from Firebase Storage
    const file = firebaseStorage.file(fileName);
    await file.delete();

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}