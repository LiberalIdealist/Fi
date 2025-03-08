import express, { Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../config/authMiddleware.js'; // Added .js extension
import { db, storage } from '../config/firebase.js';
import * as pdfjsLib from 'pdfjs-dist';
import { parsePdf } from '../utils/pdfParser.js'; // Use existing utility

// Configure pdfjs worker
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const router = express.Router();

// Add user type definition for req.user
declare global {
  namespace Express {
    interface Request {
      user: {
        uid: string;
        [key: string]: any;
      };
    }
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

// Parse PDF text - Use the utility function instead
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  return await parsePdf(pdfBuffer);
}

// Upload document route
router.post('/upload', authMiddleware, upload.single('document'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const userId = req.user.uid;
    const { name, description, category } = req.body;

    // Process file based on mimetype
    let textContent = '';
    if (file.mimetype === 'application/pdf') {
      textContent = await extractTextFromPdf(file.buffer);
    } else if (file.mimetype.startsWith('text/')) {
      textContent = file.buffer.toString('utf-8');
    } else {
      res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or text file.' });
      return;
    }

    // Upload file to Firebase Storage
    const bucket = storage.bucket();
    const fileRef = bucket.file(`documents/${userId}/${Date.now()}-${file.originalname}`);
    
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      }
    });
    
    const downloadUrl = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });

    // Save document metadata to Firestore
    const docRef = await db.collection('documents').add({
      userId,
      name: name || file.originalname,
      description: description || '',
      category: category || 'other',
      mimeType: file.mimetype,
      size: file.size,
      uploadDate: new Date(),
      fileUrl: downloadUrl[0],
      textContent,
    });

    res.status(200).json({
      id: docRef.id,
      name: name || file.originalname,
      description: description || '',
      category: category || 'other',
      uploadDate: new Date(),
      fileUrl: downloadUrl[0],
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get user documents
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.uid;
    const documentsSnapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .orderBy('uploadDate', 'desc')
      .get();

    const documents: Array<{id: string, [key: string]: any}> = [];
    documentsSnapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const documentId = req.params.id;
    const userId = req.user.uid;
    
    const documentSnapshot = await db.collection('documents').doc(documentId).get();
    
    if (!documentSnapshot.exists) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    const documentData = documentSnapshot.data();
    
    // Check if this document belongs to the authenticated user
    if (!documentData || documentData.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    res.json({
      id: documentSnapshot.id,
      ...documentData,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Delete document
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const documentId = req.params.id;
    const userId = req.user.uid;
    
    // Get document data to check ownership and get file path
    const documentSnapshot = await db.collection('documents').doc(documentId).get();
    
    if (!documentSnapshot.exists) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    const documentData = documentSnapshot.data();
    
    // Check if this document belongs to the authenticated user
    if (!documentData || documentData.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    // Get file path from fileUrl
    const fileUrl = documentData.fileUrl;
    const urlParts = new URL(fileUrl);
    const filePath = decodeURIComponent(urlParts.pathname.split('/o/')[1].split('?')[0]);
    
    // Delete file from storage
    try {
      await storage.bucket().file(filePath).delete();
    } catch (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue execution to delete the database entry
    }
    
    // Delete document from Firestore
    await db.collection('documents').doc(documentId).delete();
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;