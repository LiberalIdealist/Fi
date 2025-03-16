import { Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "../../config/firebase.js";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Initialize Firestore
const db = getFirestore();

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
 * Upload document controller for Express (server-side)
 */
export async function uploadDocumentServer(req: Request, res: Response) {
  try {
    if (!req.file || !req.user?.uid) {
      return res.status(400).json({ error: "File and authenticated user are required" });
    }

    const file = req.file;
    const userId = req.user.uid;
    const documentId = uuidv4();

    // Define storage path (using Admin SDK)
    const bucket = storage.bucket();
    const fileName = `documents/${userId}/${documentId}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUpload = bucket.file(fileName);

    // Set file metadata
    const metadata = {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadDate: new Date().toISOString(),
        documentId: documentId,
        userId: userId
      }
    };

    // Upload file
    await fileUpload.save(file.buffer, { 
      contentType: file.mimetype,
      metadata: metadata.metadata
    });

    // Generate a signed URL that expires after 7 days
    const [signedUrl] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Store document metadata in Firestore
    const docData = {
      id: documentId,
      userId: userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileUrl: signedUrl,
      storagePath: fileName,
      fileSize: file.size,
      uploadDate: new Date(),
      status: 'uploaded'
    };
    
    const docRef = await addDoc(collection(db, 'documents'), docData);

    res.status(201).json({ 
      success: true, 
      documentId: documentId,
      fileUrl: signedUrl,
      document: {
        ...docData,
        firestoreId: docRef.id
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Install types package first:
// npm i --save-dev @types/uuid