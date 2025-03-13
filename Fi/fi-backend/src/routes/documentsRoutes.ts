import express, { Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../config/authMiddleware.js'; // Added .js extension
import { db, storage } from '../config/firebase.js';
import { parsePdf } from '../utils/pdfParser.js'; // Only using our simplified parser
import { localDocumentStore } from '../models/documents/localStore.js';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import axios from 'axios';

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

// Define multer filter function
function multerFilter(_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void {
  // Accept only PDF and text files
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) {
    callback(null, true);
  } else {
    callback(null, false);
  }
}

// Define multer storage configuration
const multerStorage = multer.memoryStorage(); // Example storage configuration, adjust as needed

// Configure multer for file uploads
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Debug endpoint to check authentication
router.get('/auth-check', authMiddleware, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

// Upload document route
router.post('/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const userId = req.body.userId || req.user?.uid;
    
    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    
    const { name, description, category } = req.body;
    const fileName = `${Date.now()}-${file.originalname}`;
    
    // Process file based on mimetype
    let textContent = '';
    try {
      if (file.mimetype === 'application/pdf') {
        try {
          textContent = await parsePdf(file.buffer);
        } catch (parseError) {
          console.error('Error parsing PDF:', parseError);
          textContent = 'PDF content extraction failed';
        }
      } else if (file.mimetype.startsWith('text/')) {
        textContent = file.buffer.toString('utf-8');
      }
    } catch (contentError) {
      console.error('Error extracting content:', contentError);
      // Continue without content
    }

    let fileUrl = '';
    let documentId = '';
    let usingFallback = false;
    
    // Try Firebase Storage first
    try {
      console.log('Attempting to upload to Firebase Storage...');
      const bucket = storage.bucket();
      console.log(`Uploading file to bucket: ${bucket.name}`);
      
      const fileRef = bucket.file(`documents/${userId}/${fileName}`);
      await fileRef.save(file.buffer, {
        metadata: { contentType: file.mimetype }
      });
      
      const [downloadUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });
      
      fileUrl = downloadUrl;
      console.log('File uploaded to Firebase Storage successfully');
      
      // Try to store in Firestore
      try {
        console.log('Saving document metadata to Firestore...');
        const docRef = await db.collection('documents').add({
          userId,
          name: name || file.originalname,
          description: description || '',
          category: category || 'other',
          mimeType: file.mimetype,
          size: file.size,
          uploadDate: new Date(),
          fileUrl,
          textContent,
        });
        
        documentId = docRef.id;
        console.log('Document saved to Firestore with ID:', documentId);
      } catch (firestoreError) {
        console.error('Firestore error, using local fallback:', firestoreError);
        usingFallback = true;
        
        // Store metadata in local store as backup
        const localDoc = localDocumentStore.addDocument({
          userId,
          name: name || file.originalname,
          description: description || '',
          category: category || 'other',
          mimeType: file.mimetype,
          size: file.size,
          uploadDate: new Date(),
          fileUrl,
          textContent
        });
        
        documentId = localDoc.id;
        console.log('Document saved to local store with ID:', documentId);
      }
    } catch (storageError) {
      console.error('Firebase Storage error, using local fallback:', storageError);
      usingFallback = true;
      
      // Store the file in memory as fallback
      const localDoc = localDocumentStore.addDocument({
        userId,
        name: name || file.originalname,
        description: description || '',
        category: category || 'other',
        mimeType: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
        localUrl: `/local-files/${userId}/${fileName}`,
        textContent
      });
      
      documentId = localDoc.id;
      localDocumentStore.storeFile(documentId, file.buffer);
      fileUrl = `/api/documents/local/${documentId}`; // Local file access endpoint
      console.log('Document saved to local store with ID:', documentId);
    }

    res.status(200).json({
      success: true,
      id: documentId,
      name: name || file.originalname,
      description: description || '',
      category: category || 'other',
      uploadDate: new Date(),
      fileUrl,
      usingFallback
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Add a route to serve locally stored files
router.get('/local/:id', authMiddleware, (req, res) => {
  try {
    const documentId = req.params.id;
    const document = localDocumentStore.getDocument(documentId);
    
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    // Verify ownership
    if (document.userId !== req.user.uid) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const fileBuffer = localDocumentStore.getFile(documentId);
    if (!fileBuffer) {
      res.status(404).json({ error: 'File content not found' });
      return;
    }
    
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving local file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
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

// Get local documents for a user
router.get('/local', authMiddleware, (req, res) => {
  try {
    const userId = req.user.uid;
    const documents = localDocumentStore.getDocumentsForUser(userId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching local documents:', error);
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

// Delete local document
router.delete('/local/:id', authMiddleware, (req, res) => {
  try {
    const documentId = req.params.id;
    const document = localDocumentStore.getDocument(documentId);
    
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    if (document.userId !== req.user.uid) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const deleted = localDocumentStore.deleteDocument(documentId);
    
    if (deleted) {
      res.status(200).json({ message: 'Document deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  } catch (error) {
    console.error('Error deleting local document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Analyze document route
router.post('/analyze', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, fileUrl } = req.body;
    
    // Check for required parameters
    if (!documentId && !fileUrl) {
      res.status(400).json({ error: 'Either documentId or fileUrl is required' });
      return;
    }
    
    // Verify userId access if documentId is provided
    if (documentId) {
      // Check if it's a local document
      if (documentId.startsWith('local_')) {
        const document = localDocumentStore.getDocument(documentId);
        
        if (!document) {
          res.status(404).json({ error: 'Document not found' });
          return;
        }
        
        if (document.userId !== req.user.uid) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }
        
        // Add user info to the request for processing
        req.body.userId = req.user.uid;
      } 
      // Or a Firestore document
      else {
        try {
          const docSnapshot = await db.collection('documents').doc(documentId).get();
          
          if (!docSnapshot.exists) {
            res.status(404).json({ error: 'Document not found' });
            return;
          }
          
          const docData = docSnapshot.data();
          if (docData?.userId !== req.user.uid) {
            res.status(403).json({ error: 'Access denied' });
            return;
          }
          
          // If the fileUrl wasn't provided, get it from the document data
          if (!fileUrl && docData?.fileUrl) {
            req.body.fileUrl = docData.fileUrl;
          }
        } catch (error) {
          console.error('Error verifying document access:', error);
          res.status(500).json({ error: 'Error verifying document access' });
          return;
        }
      }
    }
    
    // Forward to the analyze document function
    await analyzeDocument(req, res);
  } catch (error) {
    console.error('Error in analyze route:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// Add this route after your other document routes

// Get all document analyses for a user
router.get('/analyses', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.uid;
    
    // Try to get analyses from Firestore
    try {
      const analysesSnapshot = await db.collection('documentAnalyses')
        .where('userId', '==', userId)
        .orderBy('analyzedAt', 'desc')
        .get();
      
      const analyses: any[] = [];
      analysesSnapshot.forEach(doc => {
        analyses.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      res.json(analyses);
      return;
    } catch (error) {
      console.error('Error fetching analyses from Firestore:', error);
      // Fall through to fetch documents and generate placeholder analyses
    }
    
    // If no analyses found or Firestore error, create placeholders from documents
    const documentsSnapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .orderBy('uploadDate', 'desc')
      .get();
    
    const documents: any[] = [];
    documentsSnapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    // Also fetch local documents
    const localDocs = localDocumentStore.getDocumentsForUser(userId);
    
    // Create placeholder analyses for all documents
    const placeholderAnalyses = [...documents, ...localDocs].map(doc => ({
      documentId: doc.id,
      documentName: doc.name,
      uploadTimestamp: doc.uploadDate ? new Date(doc.uploadDate).getTime() : Date.now(),
      fileUrl: doc.fileUrl || doc.localUrl,
      needsAnalysis: true
    }));
    
    res.json(placeholderAnalyses);
  } catch (error) {
    console.error('Error fetching document analyses:', error);
    res.status(500).json({ error: 'Failed to fetch document analyses' });
  }
});

export default router;

// Function to analyze document content
async function analyzeDocument(req: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: express.Response<any, Record<string, any>>): Promise<void> {
  try {
    const { documentId, fileUrl } = req.body;
    const userId = req.user.uid;
    
    let textContent = '';
    let documentData = null;
    
    // Get document content based on provided information
    if (documentId) {
      // Handle local document
      if (documentId.startsWith('local_')) {
        const document = localDocumentStore.getDocument(documentId);
        if (!document) {
          res.status(404).json({ error: 'Document not found in local store' });
          return;
        }
        
        textContent = document.textContent || '';
        documentData = document;
      } else {
        // Handle Firestore document
        const docSnapshot = await db.collection('documents').doc(documentId).get();
        if (!docSnapshot.exists) {
          res.status(404).json({ error: 'Document not found in Firestore' });
          return;
        }
        
        documentData = docSnapshot.data();
        textContent = documentData?.textContent || '';
        
        // If no text content is stored, try to fetch and parse from fileUrl
        if (!textContent && documentData?.fileUrl) {
          try {
            const response = await axios.get(documentData.fileUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            
            if (documentData.mimeType === 'application/pdf') {
              textContent = await parsePdf(buffer);
            } else if (documentData.mimeType.startsWith('text/')) {
              textContent = buffer.toString('utf-8');
            }
            
            // Update the document with extracted text content
            await db.collection('documents').doc(documentId).update({
              textContent
            });
          } catch (error) {
            console.error('Error fetching or parsing document content:', error);
          }
        }
      }
    } 
    // Try to fetch and analyze content from URL directly if no document ID provided
    else if (fileUrl) {
      try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        const buffer = Buffer.from(response.data);
        
        if (contentType === 'application/pdf') {
          textContent = await parsePdf(buffer);
        } else if (contentType?.startsWith('text/')) {
          textContent = buffer.toString('utf-8');
        } else {
          res.status(400).json({ error: 'Unsupported file format for analysis' });
          return;
        }
      } catch (error) {
        console.error('Error fetching file from URL:', error);
        res.status(500).json({ error: 'Failed to fetch document from URL' });
        return;
      }
    }
    
    if (!textContent) {
      res.status(400).json({ error: 'No text content available for analysis' });
      return;
    }
    
    // Basic analysis logic
    const wordCount = textContent.split(/\s+/).length;
    const characterCount = textContent.length;
    
    // Extract some key phrases (simple implementation)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPhrases = sentences
      .slice(0, Math.min(5, sentences.length))
      .map(s => s.trim())
      .filter(s => s.split(/\s+/).length > 3);
    
    // Save analysis results
    const analysisResults = {
      documentId,
      userId,
      analyzedAt: new Date(),
      statistics: {
        wordCount,
        characterCount,
        sentenceCount: sentences.length
      },
      keyPhrases,
      summary: keyPhrases.join(' ').substring(0, 200) + '...'
    };
    
    // Store analysis in database
    try {
      if (documentId) {
        await db.collection('documentAnalyses').add(analysisResults);
      }
    } catch (dbError) {
      console.error('Failed to store analysis results:', dbError);
      // Continue to return results even if storage fails
    }
    
    res.status(200).json({
      success: true,
      analysis: analysisResults
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
}

