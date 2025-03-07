import { Request, Response } from "express";
import multer from "multer";
import { storage as firebaseStorage } from "../../config/firebase.js";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Handle file upload using multer middleware
 */
export const uploadMiddleware = upload.single('file');

/**
 * Upload document controller for Express
 */
export async function uploadDocument(req: Request, res: Response) {
  try {
    if (!req.file || !req.body.userId) {
      return res.status(400).json({ error: "File and userId are required" });
    }

    const file = req.file;
    const userId = req.body.userId;

    // Define storage path
    const bucket = firebaseStorage;
    const fileName = `uploads/${userId}/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // Upload file
    await fileUpload.save(file.buffer, { 
      contentType: file.mimetype 
    });

    const fileUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}