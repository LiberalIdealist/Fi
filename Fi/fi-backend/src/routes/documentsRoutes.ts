import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { storage as firebaseStorage } from '../config/firebase.js'; // Use one storage solution
import { analyzeText } from '../utils/googleNLP.js';
import pdfParse from 'pdf-parse';

// Helper function for async route handlers
const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload document route
router.post('/upload', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file || !req.body.userId) {
    res.status(400).json({ error: "File and userId are required" });
    return;
  }

  // Define storage path
  const fileName = `uploads/${req.body.userId}/${Date.now()}-${req.file.originalname}`;
  const fileUpload = firebaseStorage.file(fileName);

  // Upload file
  await fileUpload.save(req.file.buffer, { contentType: req.file.mimetype });
  const fileUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;

  res.json({ success: true, fileUrl });
}));

// Analyze document route
router.post("/analyze", asyncHandler(async (req: Request, res: Response) => {
  const { fileUrl } = req.body;
    
  if (!fileUrl) {
    res.status(400).json({ error: "File URL is required" });
    return;
  }

  // Download the file from Google Cloud Storage
  const bucketName = process.env.GCS_BUCKET_NAME as string;
  const fileName = fileUrl.split(`/${bucketName}/`)[1];
  const file = firebaseStorage.file(fileName);

  const [fileBuffer] = await file.download();
  const pdfData = await pdfParse(fileBuffer);
  const extractedText = pdfData.text;

  if (!extractedText) {
    res.status(500).json({ error: "Could not extract text from PDF" });
    return;
  }

  // Analyze text using Google NLP
  const analysis = await analyzeText(extractedText);
  res.json({ success: true, analysis });
}));

// Delete document route
router.delete('/delete', asyncHandler(async (req: Request, res: Response) => {
  const { fileUrl } = req.body;
  
  if (!fileUrl) {
    res.status(400).json({ error: "File URL is required" });
    return;
  }

  // Extract file name from URL
  const bucketName = process.env.GCS_BUCKET_NAME as string;
  const fileName = fileUrl.split(`/${bucketName}/`)[1];
  
  // Delete the file
  const file = firebaseStorage.file(fileName);
  await file.delete();

  res.json({ success: true, message: "File deleted successfully" });
}));

export default router;